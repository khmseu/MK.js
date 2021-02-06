import { ConfigVar } from "./ConfigVar";
import { EnvironmentVar } from "./EnvironmentVar";
import { Json } from "./Json";
import { DEBUG, log } from "./Log";
import { TargetMap } from "./Target";
import { Variable } from "./Variable";
import Log = require("./Log");

const word = "[a-zA-Z_][a-zA-Z_0-9]*";
const num = "[-+]?\\d+";
const matchconf = `@${word}`;
const matchenv = `$${word}`;
const matchname = word;
const matchdown = `\\.(${word})|\\[(${word}|${num})\\]`;
const matchvar = `{${matchconf}|${matchenv}|\\.?${matchname}(${matchdown})*}`;
const matchvar_re = RegExp(matchvar, "g");
const matchname_re = RegExp(`^(${matchname})(.*)$`);
const matchdown_re = RegExp(`^(${matchdown})(.*)$`);
const matchword_re = RegExp(`^${word}$`);
const matchnum_re = RegExp(`^${num}$`);

export function resolveVar(text: string, toVar: true): Variable;
export function resolveVar(text: string): string;
export function resolveVar(text: string, toVar?: boolean): Variable | string {
  enum GL {
    global,
    local,
  }
  let v: Variable, vv: Json, vvv: Variable | string;
  switch (text[0]) {
    case "@":
      v = new ConfigVar(text.substring(1));
      if (toVar) return v;
      vv = v.value();
      return String(vv);
      break;
    case "$":
      v = new EnvironmentVar(text.substring(1));
      if (toVar) return v;
      vv = v.value();
      return String(vv);
      break;
    case ".":
      vvv = resolveNormalVar(text.substring(1), GL.local);
      return vvv;
      break;
    default:
      vvv = resolveNormalVar(text, GL.global);
      return vvv;
      break;
  }

  function resolveNormalVar(text: string, gl: GL.global | GL.local) {
    const matches = text.match(matchname_re);
    if (!matches || (toVar && matches[2].length > 0))
      throw new Error(`Bad variable '${text}'`);
    let v = (gl = GL.global)
      ? TargetMap.global(matches[1], Variable)
      : (gl = GL.local)
      ? TargetMap.local(matches[1], Variable)
      : <Variable>throwError(`Bad parameter '${gl}'`);
    if (toVar) return v;
    let vv = v.value();
    if (DEBUG) log({ var: matches[1], val: vv });
    let tail = matches[2];
    while (tail) {
      const tmatches = tail.match(matchdown_re);
      // log({ tmatches });
      if (!tmatches) throw new Error(`Bad tail '${tail}'`);
      let key;
      switch (tail[0]) {
        case ".":
          if (typeof vv !== "object")
            throw new Error(`type is ${typeof vv}, not object`);
          key = tmatches[2];
          vv = (vv as { [key: string]: Json })[key];
          break;
        case "[":
          if (!Array.isArray(vv))
            throw new Error(`type is ${typeof vv}, not array`);
          key = tmatches[3];
          if (key.match(matchword_re)) {
            key = resolveVar(key);
          }
          if (!key.match(matchnum_re))
            throw new Error(`Index value '${key}' is not a number`);
          let vvv = parseInt(key);
          vv = vv[vvv];
          break;
        default:
          throw new Error(`Bad tail '${tail}'`);
      }
      if (DEBUG) log({ field: tmatches[2], index: tmatches[3], new_value: vv });
      tail = tmatches[4];
    }
    return String(tail);

    function throwError(e: string): any {
      throw new Error(e);
    }
  }
}

export function interpolate(text: string): string {
  return text.replace(matchvar_re, (full, name) => {
    const ret1 = resolveVar(name);
    const ret = interpolate(ret1);
    if (DEBUG) log("map ", full, " -> ", ret1, " -> ", ret);
    return ret;
  });
}

Log.DEBUG = true;
resolveVar("bla.blubb[5][foo]");
