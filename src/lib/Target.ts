import { ArrayOrOne } from "./ArrayOrOne";

export abstract class Target {
  private _dependencies: string[] = [];
  constructor(private _name: string, private _timestamp: Date = new Date()) {}
  public timestamp(): Date {
    return this._timestamp;
  }
  protected set_timestamp() {
    this._timestamp = new Date();
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
