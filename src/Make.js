"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPhony = exports.getStat = void 0;
const async_1 = require("async");
const events_1 = require("events");
const fs_1 = require("fs");
const is_absolute_1 = __importDefault(require("is-absolute"));
const lodash_1 = require("lodash");
const path_1 = require("path");
class Make extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.targets = Object.create(null);
        this.workingDir = process.cwd();
        this.extraArgs = [];
    }
    toAbsolute(target) {
        if (isPhony(target)) {
            return target;
        }
        return path_1.resolve(this.workingDir, target);
    }
    cwd(newcwd) {
        if (newcwd === undefined) {
            return this.workingDir;
        }
        else {
            if (!is_absolute_1.default(newcwd)) {
                throw new Error("For clarity, please assign a absolute path to cwd");
            }
            this.workingDir = newcwd;
        }
    }
    args() {
        return this.extraArgs;
    }
    initTarget(target) {
        if (!(target in this.targets)) {
            this.targets[target] = new Target();
        }
    }
    rule(target, dependencies, action) {
        var makeInst = this;
        if (!lodash_1.isString(target))
            throw new Error(`Target must be string, but '${target.toString()}' given`);
        target = makeInst.toAbsolute(target);
        this.initTarget(target);
        if (!lodash_1.isArray(dependencies))
            throw new Error(`Dependencies must be array, but '${dependencies.toString()}' given`);
        dependencies = dependencies.map(function (dep) {
            if (!lodash_1.isString(dep))
                throw new Error(`Dependencies must all be string, but '${dep.toString()}' given`);
            dep = makeInst.toAbsolute(dep);
            makeInst.initTarget(dep);
            return dep;
        });
        dependencies.forEach((s) => makeInst.targets[target].dependsOn.add(s));
        if (action !== null && action !== undefined) {
            if (!lodash_1.isFunction(action))
                throw new Error(`Action must be function, but '${action.toString()}' given`);
            makeInst.targets[target].action = action;
        }
    }
    run(target, callback) {
        var makeInst = this;
        // validate input
        if (!lodash_1.isString(target))
            callback(new Error(`Target must be string, but '${target.toString()}' given`));
        target = makeInst.toAbsolute(target);
        if (!(target in makeInst.targets))
            callback(new Error(`No rule to make target '${target}'
`));
        var fulfilled = new StringSet();
        var active = new StringSet();
        var finished = false;
        var requiredTargets = new StringSet();
        // find all the required targets
        function addDepsToRequiredTargets(target, parents) {
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
                callback(new Error(`Target(s) '${notDone.toString()}' did not call done`));
            }
        }
        function callbackWrapper(err) {
            finished = true;
            process.removeListener("beforeExit", processListener);
            makeInst.removeListener("done", doneListener);
            callback(err);
        }
        function runRecursive(target, callback) {
            for (var t in requiredTargets.values()) {
                if (active.has(t) ||
                    fulfilled.has(t) ||
                    !makeInst.targets[t].dependsOn.isSubsetOf(fulfilled)) {
                    continue;
                }
                active.add(t);
                (function (t) {
                    getStat(t, function (err, targetStat) {
                        if (finished) {
                            return;
                        }
                        if (err && err.code === "ENOENT") {
                            targetStat = null;
                        }
                        else if (err) {
                            callback(err);
                        }
                        async_1.map(makeInst.targets[t].dependsOn.values(), getStat, function (err, stats) {
                            //async could send undefined
                            if (err === undefined)
                                err = null;
                            if (finished) {
                                return;
                            }
                            if (err) {
                                callback(err);
                            }
                            var shouldRun = false;
                            if (stats === undefined) {
                                shouldRun = true;
                            }
                            else if (targetStat === null ||
                                stats.some(function (s) {
                                    return s === null;
                                })) {
                                shouldRun = true;
                            }
                            else if (stats.some(function (s) {
                                return (s !== null &&
                                    s !== undefined &&
                                    targetStat !== null &&
                                    targetStat !== undefined &&
                                    s.mtime > targetStat.mtime);
                            })) {
                                shouldRun = true;
                            }
                            else if (stats.length === 0) {
                                shouldRun = true;
                            }
                            if (shouldRun) {
                                makeInst.targets[t].action(done, t, Array.from(makeInst.targets[t].dependsOn.values()));
                            }
                            else {
                                done(null);
                            }
                        });
                    });
                    function done(err) {
                        if (finished) {
                            return;
                        }
                        if (err === undefined)
                            err = null;
                        if (!active.has(t)) {
                            callback(new Error(`Done is invoked twice for target '${t}'`));
                        }
                        active.delete(t);
                        if (err === null) {
                            fulfilled.add(t);
                            if (!isPhony(t)) {
                                fs_1.readFile(t, function (e) {
                                    if (e !== null && e.code === "ENOENT") {
                                        callback(new Error(`File target '${t}' does not exist after its action is performed`));
                                    }
                                    else if (e !== null) {
                                        callback(e);
                                    }
                                    else {
                                        if (t === target) {
                                            callback(err);
                                        }
                                        else {
                                            runRecursive(target, callback);
                                        }
                                    }
                                });
                            }
                            else {
                                if (t === target) {
                                    callback(err);
                                }
                                else {
                                    runRecursive(target, callback);
                                }
                            }
                        }
                        else {
                            callback(err);
                        }
                    }
                })(t);
            }
        }
    }
}
exports.default = Make;
class StringSet extends Set {
    isSubsetOf(other) {
        for (let elem of this) {
            if (!other.has(elem)) {
                return false;
            }
        }
        return true;
    }
}
class Target {
    constructor() {
        this.dependsOn = new StringSet();
        this.action = noop;
    }
}
function getStat(target, callback) {
    if (isPhony(target)) {
        callback(null, null);
        return;
    }
    fs_1.stat(target, function (err, stat) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, stat);
        }
    });
}
exports.getStat = getStat;
function isPhony(target) {
    return target[0] === ":";
}
exports.isPhony = isPhony;
function noop(done) {
    done(undefined);
}
