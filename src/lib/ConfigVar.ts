import { Json } from "./Json";
import { SerializedValue } from "./SerializedValue";
import { Variable } from "./Variable";

export class ConfigVar extends Variable {
  constructor(name_: string, value_: Json, timestamp_: Date = new Date()) {
    super(name_, value_, timestamp_);
  }
  serialize(): SerializedValue {
    return {
      name: this.name(),
      timestamp: this.timestamp().valueOf(),
      value: JSON.stringify(this.value()),
    };
  }
  static deserialize(json: SerializedValue) {
    return new ConfigVar(
      json.name,
      JSON.parse(json.value),
      new Date(json.timestamp)
    );
  }
}
