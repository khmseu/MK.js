"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
const process_1 = require("process");
let top;
async function readRules(dirName) {
    const fullfn = path_1.join(dirName, "mk.json");
    const src = await promises_1.readFile(fullfn, { encoding: "utf-8" });
    const obj = JSON.parse(src);
    return obj;
}
async function main() {
    const top = await promises_1.realpath(process_1.cwd());
    const trobj = await readRules(top);
}
main()
    .then(() => console.log("Ok"))
    .catch((e) => console.error(e));
