import { Json } from "./Json";
import { Target } from "./Target";

export class Variable extends Target {
  private value_: Json = null;
  constructor(name_: string) {
    super(name_, new Date());
  }
  value(): Json {
    return this.value_;
  }
  set_value(value_: Json) {
    this.value_ = value_;
    this.set_timestamp();
  }
}
