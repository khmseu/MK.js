import { resolve } from "path";
import { ArrayOrOne } from "./ArrayOrOne";

type Recipe = null | ((self: Target) => Promise<void>);
export abstract class Target {
  private _dependencies: string[] = [];
  private _recipe: Recipe = null;
  private _timestamp: Date = new Date();
  public recipe(): Recipe {
    return this._recipe;
  }
  public set_recipe(value: Recipe) {
    this._recipe = value;
  }
  constructor(private _name: string) {}
  public async timestamp(): Promise<Date> {
    return this._timestamp;
  }
  public set_timestamp(ts = new Date()) {
    this._timestamp = ts;
  }
  public name(): string {
    return this._name;
  }
  public dependencies(): string[] {
    return [...this._dependencies];
  }
  public add_dependencies(value: ArrayOrOne<string>) {
    if (!Array.isArray(value)) value = [value];
    this._dependencies.push(
      ...value.map((v) => {
        if (/\//.test(v)) return resolve(v);
        return v;
      })
    );
  }
  public async doRecipe(): Promise<void> {
    if (this._recipe) await this._recipe(this);
    this.set_timestamp();
  }
}
