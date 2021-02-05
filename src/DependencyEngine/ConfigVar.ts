import { configData } from "./ConfigData";
import { Json } from "./Json";
import { Variable } from "./Variable";

export class ConfigVar extends Variable {
  constructor(name_: string) {
    super(name_);
    const sv = configData().lookup(name_);
    if (sv) {
      this.set_value(JSON.parse(sv.value));
      this.set_timestamp(new Date(sv.time_stamp));
    }
  }
  set_value(value_: Json) {
    super.set_value(value_);
    configData().save({
      name: this.name(),
      time_stamp: this.timestamp().valueOf(),
      value: JSON.stringify(this.value()),
    });
  }
}
