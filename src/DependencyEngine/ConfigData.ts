import Database from "better-sqlite3";
import { resolve } from "path";
import { log } from "./Log";
import { SerializedValue } from "./SerializedValue";
import { throwError } from "./throwError";

let cfdb: ConfigData | null = null;
export function configData() {
  if (!cfdb) cfdb = new ConfigData();
  return cfdb;
}

const myId = "MKjs".split("").reduce((p, c) => {
  return (p << 8) | c.codePointAt(0)!;
}, 0);
const myVer = 1;
class ConfigData {
  private fn = resolve("MK.sqlite");
  private db = new Database(this.fn, { verbose: log });
  constructor() {
    const oaid = this.db.pragma("application_id");
    if (oaid === 0) this.db.pragma(`application_id=${myId}`);
    else if (oaid !== myId) throwError(`${this.fn} is not a MKfs config file`);
    const ouver = this.db.pragma("user_version");
    if (ouver < myVer) {
      this.db
        .prepare(
          `
    CREATE TABLE config(
        name VARCHAR PRIMARY KEY,
        time_stamp BIGINT,
        value VARCHAR
    )`
        )
        .run();
      this.db.pragma(`user_version=${myVer}`);
    } else if (ouver !== myVer)
      throwError(`Cannot handle version ${ouver} of ${this.fn}`);
  }
  lookup(s: string): SerializedValue | null {
    const v = this.db
      .prepare(
        `
SELECT *
FROM config
WHERE name = ?`
      )
      .get(s);
    return v
      ? {
          name: v.name,
          value: v.value,
          time_stamp: v.time_stamp,
        }
      : null;
  }
  save(sv: SerializedValue) {
    this.db
      .prepare(
        `
INSERT
    OR REPLACE INTO config(name, time_stamp, value)
VALUES(@name, @time_stamp, @value)`
      )
      .run(sv);
  }
}
