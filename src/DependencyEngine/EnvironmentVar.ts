import { Variable } from "./Variable";


export class EnvironmentVar extends Variable {
  constructor(name_: string) {
    super(name_);
    const ev = process.env[name_];
    if (ev !== undefined) {
      this.set_value(JSON.parse(ev));
    }
  }
  set_value(value_: string) {
    super.set_value(value_);
    process.env[this.name()] = value_;
  }
}
