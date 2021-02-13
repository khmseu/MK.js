import { map } from "async";
import { EventEmitter } from "events";
import { access, Stats } from "fs";
import isAbsolute from "is-absolute";
import { isArray, isFunction, isString } from "lodash";
import { resolve } from "path";
import { DEBUG, log } from "../DependencyEngine/Log";
import { ActionFunction } from "./ActionFunction";
import { ErrorFunction } from "./ErrorFunction";
import { getStat } from "./getStat";
import { isPhony } from "./isPhony";
import { Optional } from "./Optional";
import { oTarget } from "./oTarget";
import { vars } from "./oVariables";
import { StringSet } from "./StringSet";

/**
 */

export default class Make extends EventEmitter {
  private targets: Record<string, oTarget> = {};
  private workingDir: string = process.cwd();
  private extraArgs: string[] = process.argv.slice(1);
  private vars_hash = vars;
  constructor() {
    super({ captureRejections: true });
  }
  var(name: string): string;
  var(name: string, value: any): void;
  var(name: string, value?: any) {
    if (value === undefined) return this.vars_hash[name];
    this.vars_hash[name] = value;
  }
  vars() {
    return Object.keys(this.vars_hash);
  }
  toAbsolute(target: string) {
    if (isPhony(target)) {
      return target;
    }
    return resolve(this.workingDir, target);
  }
  /**
   *
   * Set baseDir to `path`, the `path` must be absolute path. Use `path.resolve()`
if you need to. Any future call to `make.rule()` with non-absolute file path
will be resolved based on this path.
   */
  baseDir(path: string): void;
  /**
   * Get current baseDir if no argument.
   * @param path
   */
  baseDir(): string;
  baseDir(path?: string) {
    if (DEBUG) log({ path });
    if (path === undefined) {
      return this.workingDir;
    } else {
      path = resolve(path);
      if (!isAbsolute(path)) {
        throw new Error("For clarity, please assign a absolute path to cwd");
      }
      this.workingDir = path;
    }
  }
  /**
   * Get a array of arguments that you passed when calling makejs from command line.
The first argument is the name of makejs command (typically 'makejs'), the second
argument is the target you are building. The rest are passed as-is.
   */
  args() {
    return this.extraArgs;
  }
  initTarget(target: string) {
    if (!(target in this.targets)) {
      if (DEBUG) log({ target });
      this.targets[target] = new oTarget();
    }
  }

  /**
   *
   * create a rule for a `target` with `dependencies`, with `action` as its
   * action.
   *
   * @param  target - A string represent the target.  if the string start with a
   * colon `:` it is treated as a _phony_target_ otherwise the string is considered
   * a file target, if the path is relative it will be resolved to absolute path
   * based on `make.baseDir()` setting.
   *
   * @param  dependencies - A array of `string` represent the dependencies of this
   * target.  if the string start with a colon `:` it is treated as a _phony_target_
   * otherwise the string is considered a file target, if the path is relative it
   * will be resolved to absolute path based on `make.baseDir()` setting.
   *
   * If you call `make.rule()` multiple times for a same target, the dependencies is
   * the union of all dependencies.
   *
   * @param  action - A function will be called when the all of the dependencies are
   * fulfilled and the target is being make. If action is never defined for a
   * certain target, then when the target get executed it will do a no-op function.
   * If a action is specified for a target and later specified again, the latter
   * will overwrite the earlier definition.
   *
   * The function will receive three arguments:
   *
   * `done(err)` when the action is finished executing, you must call `done()`.
   * Pass `err` if you got any.
   *
   * `target` is the absolute path of the target. If target is phony, will be the
   * name of the target (with colon).
   *
   * `dependencies` is an array of absolute path of the _dependencies_ of the
   * target.  the _dependencies_ is not guaranteed to have the same order as you
   * provided to `make.rule()`, and any duplication is removed.
   *
   * @return  Brief description of the returning value here.
   *
   */
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
    if (DEBUG) log({ target, callback, makeInst });

    // validate input
    if (!isString(target))
      callback(
        new Error(
          `Target must be string, but '${(target as Object).toString()}' given`
        )
      );

    target = makeInst.toAbsolute(target);
    if (!(target in makeInst.targets))
      callback(new Error(`No rule to make target '${target}'\n`));

    var fulfilled = new StringSet();
    var active = new StringSet();
    var finished = false;
    var requiredTargets = new StringSet();

    // find all the required targets
    function addDepsToRequiredTargets(target: string, parents: StringSet) {
      if (DEBUG) log({ target, parents });
      if (parents.has(target)) {
        callback(new Error("Circular dependencies detected"));
        return;
      }
      requiredTargets.add(target);
      parents.add(target);
      if (DEBUG) log({ requiredTargets, parents });
      if (DEBUG) log({ target, dependsOn: makeInst.targets[target].dependsOn });
      for (var deps of makeInst.targets[target].dependsOn) {
        if (DEBUG) log({ deps });
        addDepsToRequiredTargets(deps, new StringSet(parents));
      }
    }
    addDepsToRequiredTargets(target, new StringSet());
    if (DEBUG) log({ requiredTargets });

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
      if (DEBUG) log({ target, callback });
      if (DEBUG) log({ requiredTargets });
      for (var t of requiredTargets.values()) {
        if (DEBUG) log({ t });
        if (
          active.has(t) ||
          fulfilled.has(t) ||
          !makeInst.targets[t].dependsOn.isSubsetOf(fulfilled)
        ) {
          continue;
        }

        active.add(t);
        if (DEBUG) log({ active });

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
                access(t, function (e) {
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
