import { resolve } from "path";
import { log } from "./Log";
import { Target } from "./Target";

export class TargetMap {
  static globalTargetMap: {
    [key: string]: Target;
  } = {};
  static localTargetMap: {
    [key: string]: Target;
  } = {};
  static global<T extends Target>(
    name: string,
    t: (new (s: string) => T) | null
  ) {
    if (/\//.test(name)) name = resolve(name);
    let v = <T | undefined>TargetMap.globalTargetMap[name];
    log({ t, v });
    if (t && !v) {
      const tt = new t(name);
      log({ tt });
      v = this.globalTargetMap[name] = tt;
    }
    log({ v });
    return v;
  }
  static local<T extends Target>(
    name: string,
    t: (new (s: string) => T) | null
  ) {
    let v = <T | undefined>TargetMap.localTargetMap[name];
    log({ t, v });
    if (t && !v) v = this.localTargetMap[name] = new t(name);
    log({ v });
    return v;
  }
}
