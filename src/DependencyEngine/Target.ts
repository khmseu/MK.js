import { ArrayOrOne } from "./ArrayOrOne";

export abstract class Target {
  private _dependencies: string[] = [];
  constructor(private _name: string, private _timestamp: Date = new Date()) {}
  public timestamp(): Date {
    return this._timestamp;
  }
  protected set_timestamp(ts = new Date()) {
    this._timestamp = ts;
  }
  public name(): string {
    return this._name;
  }
  public dependencies(): string[] {
    return [...this._dependencies];
  }
  public add_dependencies(value: ArrayOrOne<string>) {
    if (Array.isArray(value)) this._dependencies.push(...value);
    else this._dependencies.push(value);
  }
}

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
