"use strict";

import { map } from "async";
import { EventEmitter } from "events";
import { readFile, stat, Stats } from "fs";
import isAbsolute from "is-absolute";
import { isArray, isFunction, isString } from "lodash";
import { resolve } from "path";

export default class Make extends EventEmitter {
  targets: Record<string, Target> = Object.create(null);
  workingDir: string = process.cwd();
  extraArgs: never[] = [];
  toAbsolute(target: string) {
    if (isPhony(target)) {
      return target;
    }
    return resolve(this.workingDir, target);
  }
  cwd(newcwd?: string) {
    if (newcwd === undefined) {
      return this.workingDir;
    } else {
      if (!isAbsolute(newcwd)) {
        throw new Error("For clarity, please assign a absolute path to cwd");
      }
      this.workingDir = newcwd;
    }
  }
  args() {
    return this.extraArgs;
  }
  initTarget(target: string) {
    if (!(target in this.targets)) {
      this.targets[target] = new Target();
    }
  }
  rule(
    target: string | number,
    dependencies: string[],
    action: Optional<ActionFunction>
  ) {
    var makeInst = this;

    if (!isString(target))
      throw new Error(
        `Target must be string, but '${target.toString()}' given`
      );

    target = makeInst.toAbsolute(target);
    this.initTarget(target);

    if (!isArray(dependencies))
      throw new Error(
        `Dependencies must be array, but '${(dependencies as Object).toString()}' given`
      );

    dependencies = dependencies.map(function (dep) {
      if (!isString(dep))
        throw new Error(
          `Dependencies must all be string, but '${(dep as Object).toString()}' given`
        );

      dep = makeInst.toAbsolute(dep);
      makeInst.initTarget(dep);
      return dep;
    });

    dependencies.forEach((s) => makeInst.targets[target].dependsOn.add(s));

    if (action !== null && action !== undefined) {
      if (!isFunction(action))
        throw new Error(
          `Action must be function, but '${(action as Object).toString()}' given`
        );

      makeInst.targets[target].action = action;
    }
  }
  run(target: string, callback: ErrorFunction) {
    var makeInst = this;

    // validate input
    if (!isString(target))
      callback(
        new Error(
          `Target must be string, but '${(target as Object).toString()}' given`
        )
      );

    target = makeInst.toAbsolute(target);
    if (!(target in makeInst.targets))
      callback(
        new Error(`No rule to make target '${target}'
`)
      );

    var fulfilled = new StringSet();
    var active = new StringSet();
    var finished = false;
    var requiredTargets = new StringSet();

    // find all the required targets
    function addDepsToRequiredTargets(target: string, parents: StringSet) {
      if (parents.has(target)) {
        callback(new Error("Circular dependencies detected"));
        return;
      }
      requiredTargets.add(target);
      parents.add(target);
      for (var deps in makeInst.targets[target].dependsOn) {
        addDepsToRequiredTargets(deps, new StringSet(parents));
      }
    }
    addDepsToRequiredTargets(target, new StringSet());

    process.on("beforeExit", processListener);
    makeInst.on("done", doneListener);
    runRecursive(target, callbackWrapper);

    function processListener() {
      makeInst.emit("done");
    }

    function doneListener() {
      var notDone = Array.from(active);
      if (notDone.length > 0) {
        callback(
          new Error(`Target(s) '${notDone.toString()}' did not call done`)
        );
      }
    }

    function callbackWrapper(err: Optional<Error>) {
      finished = true;
      process.removeListener("beforeExit", processListener);
      makeInst.removeListener("done", doneListener);
      callback(err);
    }

    function runRecursive(target: string, callback: ErrorFunction) {
      for (var t in requiredTargets.values()) {
        if (
          active.has(t) ||
          fulfilled.has(t) ||
          !makeInst.targets[t].dependsOn.isSubsetOf(fulfilled)
        ) {
          continue;
        }

        active.add(t);

        (function (t) {
          getStat(
            t,
            function (err: Optional<Error>, targetStat: Optional<Stats>) {
              if (finished) {
                return;
              }

              if (err && (err as NodeJS.ErrnoException).code === "ENOENT") {
                targetStat = null;
              } else if (err) {
                callback(err);
              }

              map(
                makeInst.targets[t].dependsOn.values(),
                getStat,
                function (err, stats) {
                  //async could send undefined
                  if (err === undefined) err = null;

                  if (finished) {
                    return;
                  }

                  if (err) {
                    callback(err);
                  }

                  var shouldRun = false;

                  if (stats === undefined) {
                    shouldRun = true;
                  } else if (
                    targetStat === null ||
                    stats.some(function (s) {
                      return s === null;
                    })
                  ) {
                    shouldRun = true;
                  } else if (
                    stats.some(function (s) {
                      return (
                        s !== null &&
                        s !== undefined &&
                        targetStat !== null &&
                        targetStat !== undefined &&
                        s.mtime > targetStat.mtime
                      );
                    })
                  ) {
                    shouldRun = true;
                  } else if (stats.length === 0) {
                    shouldRun = true;
                  }

                  if (shouldRun) {
                    makeInst.targets[t].action(
                      done,
                      t,
                      Array.from(makeInst.targets[t].dependsOn.values())
                    );
                  } else {
                    done(null);
                  }
                }
              );
            }
          );

          function done(err: Optional<Error>) {
            if (finished) {
              return;
            }

            if (err === undefined) err = null;

            if (!active.has(t)) {
              callback(new Error(`Done is invoked twice for target '${t}'`));
            }

            active.delete(t);

            if (err === null) {
              fulfilled.add(t);
              if (!isPhony(t)) {
                readFile(t, function (e) {
                  if (e !== null && e.code === "ENOENT") {
                    callback(
                      new Error(
                        `File target '${t}' does not exist after its action is performed`
                      )
                    );
                  } else if (e !== null) {
                    callback(e);
                  } else {
                    if (t === target) {
                      callback(err);
                    } else {
                      runRecursive(target, callback);
                    }
                  }
                });
              } else {
                if (t === target) {
                  callback(err);
                } else {
                  runRecursive(target, callback);
                }
              }
            } else {
              callback(err);
            }
          }
        })(t);
      }
    }
  }
}

class StringSet extends Set<string> {
  isSubsetOf(other: StringSet) {
    for (let elem of this) {
      if (!other.has(elem)) {
        return false;
      }
    }
    return true;
  }
}

class Target {
  dependsOn: StringSet = new StringSet();
  action: ActionFunction = noop;
}

export function getStat(target: string, callback: CallbackFunction) {
  if (isPhony(target)) {
    callback(null, null);
    return;
  }
  stat(target, function (err, stat) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, stat);
    }
  });
}

export function isPhony(target: string) {
  return target[0] === ":";
}

function noop(done: ErrorFunction) {
  done(undefined);
}

type ActionFunction = (
  done: ErrorFunction,
  target: string,
  dependencies: string[]
) => void;

type CallbackFunction = (
  err: Optional<Error>,
  targetStat: Optional<Stats>
) => void;

type ErrorFunction = (err: Optional<Error>) => void;

type Optional<T> = T | null | undefined;
