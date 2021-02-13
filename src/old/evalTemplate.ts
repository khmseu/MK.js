import { ConfigVar } from "../DependencyEngine/ConfigVar";
import { EnvironmentVar } from "../DependencyEngine/EnvironmentVar";
import { Json } from "../DependencyEngine/Json";
import { DEBUG, log } from "../DependencyEngine/Log";
import { TargetMap } from "../DependencyEngine/TargetMap";
import { throwError } from "../DependencyEngine/throwError";
import { Variable } from "../DependencyEngine/Variable";

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
      v = TargetMap.global(text.substring(1), ConfigVar)!;
      if (toVar) return v;
      vv = v.value();
      return String(vv);
      break;
    case "$":
      v = TargetMap.global(text.substring(1), EnvironmentVar)!;
      if (toVar) return v;
      vv = v.value();
      return String(vv);
      break;
    case ".":
      vvv = resolveNormalVar(text.substring(1), GL.local)!;
      return vvv;
      break;
    default:
      vvv = resolveNormalVar(text, GL.global)!;
      return vvv;
      break;
  }

  function resolveNormalVar(text: string, gl: GL.global | GL.local) {
    const matches = text.match(matchname_re);
    if (!matches || (toVar && matches[2].length > 0))
      return throwError<string>(`Bad variable '${text}'`);
    else {
      let v = (gl = GL.global)
        ? TargetMap.global(matches[1], Variable)
        : (gl = GL.local)
        ? TargetMap.local(matches[1], Variable)
        : throwError<Variable>(`Bad parameter '${gl}'`);
      if (toVar) return v;
      let vv = v!.value();
      if (DEBUG) log({ var: matches[1], val: vv });
      let tail = matches[2];
      while (tail) {
        const tmatches = tail.match(matchdown_re);
        // log({ tmatches });
        if (!tmatches) return throwError<string>(`Bad tail '${tail}'`);
        let key;
        switch (tail[0]) {
          case ".":
            if (typeof vv !== "object")
              throwError(`type is ${typeof vv}, not object`);
            key = tmatches[2];
            vv = (vv as { [key: string]: Json })[key];
            break;
          case "[":
            if (!Array.isArray(vv))
              return throwError<string>(`type is ${typeof vv}, not array`);
            key = tmatches[3];
            if (key.match(matchword_re)) {
              key = resolveVar(key);
            }
            if (!key.match(matchnum_re))
              throwError(`Index value '${key}' is not a number`);
            let vvv = parseInt(key);
            vv = vv[vvv];
            break;
          default:
            throwError(`Bad tail '${tail}'`);
        }
        if (DEBUG)
          log({ field: tmatches[2], index: tmatches[3], new_value: vv });
        tail = tmatches[4];
      }
      return String(tail);
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
