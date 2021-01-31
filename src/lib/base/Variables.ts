import { env } from "process";

export const vars: Record<string, any> = {};
vars.ENV = env;
