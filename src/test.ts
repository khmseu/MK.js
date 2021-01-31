import { error, log } from "./lib/base/Log";
import Make from "./lib/base/Make";

const make = new Make();
const vars: Record<string, any> = {};
make.vars().map((v) => {
  vars[v] = make.var(v);
});
log({ vars });
make.rule(
  "./build/test.js",
  ["./src/test.ts", "./src/Make.ts"],
  (done, target, deps) => {
    log({ done, target, deps });
    done();
  }
);
make.baseDir(".");
log({ args: make.args() });
const r = make.run("./build/test.js", (e) => {
  error({ e });
});
log({ r });
