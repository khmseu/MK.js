import { env } from "process";
import { DEBUG, log } from "./Log";

export const vars: Record<string, any> = {};
vars.ENV = env;
vars.PKG = {
  PACKAGE: "???",
  BUGREPORT: "???",
  NAME: "???",
  STRING: "???",
  TARNAME: "???",
  URL: "???",
  VERSION: "???",
};

export function evalTemplate(template: string): string {
  return template.replace(/\$\{(\w+)\.(\w+)\}/g, (full, group, name) => {
    const ret1 = String(vars[group][name]);
    const ret = evalTemplate(ret1);
    if (DEBUG) log("map ", full, " -> ", ret1, " -> ", ret);
    return ret;
  });
}
