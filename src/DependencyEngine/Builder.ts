import Aigle from "aigle";
import { EventEmitter } from "events";
import { resolve } from "path";
import { findDependency } from "./findDependency";
import { findTarget } from "./findTarget";
import { DEBUG, log } from "./Log";
import { Target } from "./Target";
import { TargetMap } from "./TargetMap";

export class Builder extends EventEmitter {
  async build(target: Target | string, limit: number) {
    if (DEBUG) log({ target, limit, builder: this });
    log({ TargetMap });
    if (typeof target === "string") {
      // canonicalize filenames
      if (/\//.test(target)) target = resolve(target);
      target = await findTarget(target);
    }
    if (DEBUG) log({ target });
    if (typeof target === "string") return;
    const depObjs: Target[] = await Aigle.mapLimit(
      target.dependencies(),
      limit,
      findDependency
    );
    await Aigle.eachLimit(depObjs, limit, (dep) => this.build(dep, limit));
    if (
      !(await Aigle.everyLimit(
        depObjs,
        limit,
        (dep) => dep.timestamp() < (target as Target).timestamp()
      ))
    ) {
      await target.doRecipe();
      // target.set_timestamp();
    }
    return true;
  }
}
