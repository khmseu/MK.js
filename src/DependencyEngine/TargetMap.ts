import { Target } from "./Target";

export class TargetMap {
  static globalTargetMap: {
    [key: string]: Target;
  } = {};
  static localTargetMap: {
    [key: string]: Target;
  } = {};
  static global<T extends Target>(name: string, t: new (s: string) => T) {
    const v = <T>TargetMap.globalTargetMap[name];
    return v ? v : new t(name);
  }
  static local<T extends Target>(name: string, t: new (s: string) => T) {
    const v = <T>TargetMap.localTargetMap[name];
    return v ? v : new t(name);
  }
}
