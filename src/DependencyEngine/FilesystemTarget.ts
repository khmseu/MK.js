import { stat } from "fs/promises";
import { oldestDate } from "./Constants";
import { Target } from "./Target";

export class FilesystemTarget extends Target {
  public async timestamp() {
    try {
      const st = await stat(this.name());
      return st.mtime;
    } catch (error) {
      return oldestDate;
    }
  }
  public set_timestamp() {
    // throwError("Not implemented for fs targets");
    // just ignore
  }
}
