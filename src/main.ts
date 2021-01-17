// import { readFile, realpath } from "fs/promises";
// import { join } from "path";
// import { cwd } from "process";
// import { RuleObject } from "./RuleObject";

import { stage } from "./Paths";

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
//   .then(() => console.log("Ok"))
//   .catch((e) => console.error(e));
console.log(stage("lisp"));
