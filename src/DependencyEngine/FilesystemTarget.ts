import { statSync } from "fs";
import { Target } from "./Target";
import { throwError } from "./throwError";

export class FilesystemTarget extends Target {
  public timestamp() {
    const st = statSync(this.name());
    return st.mtime;
  }
  public set_timestamp() {
    throwError("Not implemented for fs targets");
  }
}
