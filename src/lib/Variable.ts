import { Json } from "./Json";
import { SerializedValue } from "./SerializedValue";
import { Target } from "./Target";

export class Variable extends Target {
  constructor(
    name_: string,
    private value_: Json,
    timestamp_: Date = new Date()
  ) {
    super(name_, timestamp_);
  }
  value(): Json {
    return this.value_;
  }
  set_value(value_: Json) {
    this.value_ = value_;
    this.set_timestamp();
  }
  serialize(): SerializedValue {
    return {
      name: this.name(),
      timestamp: this.timestamp().valueOf(),
      value: JSON.stringify(this.value_),
    };
  }
  static deserialize(json: SerializedValue) {
    return new Variable(
      json.name,
      JSON.parse(json.value),
      new Date(json.timestamp)
    );
  }
}
