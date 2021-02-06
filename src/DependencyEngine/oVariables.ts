import { env } from "process";

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
