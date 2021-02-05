// import { readFile, realpath } from "fs/promises";
// import { join } from "path";
// import { cwd } from "process";
// import { RuleObject } from "./RuleObject";

import { log } from "./DependencyEngine/Log";
import { stage } from "./DependencyEngine/oPaths";

// let top;

// async function readRules(dirName: string) {
//   const fullfn = join(dirName, "mk.json");
//   const src = await readFile(fullfn, { encoding: "utf-8" });
//   const obj: RuleObject = JSON.parse(src);
//   return obj;
// }

// async function main() {
//   const top = await realpath(cwd());
//   const trobj = await readRules(top);
// }

// main()
//   .then(() => log("Ok"))
//   .catch((e) => error(e));
log(stage("lisp"));
