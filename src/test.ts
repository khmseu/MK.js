import { Builder } from "./DependencyEngine/Builder";
import { FilesystemTarget } from "./DependencyEngine/FilesystemTarget";
import { error, log, setDEBUG } from "./DependencyEngine/Log";
import { TargetMap } from "./DependencyEngine/TargetMap";
import { resolveVar } from "./old/evalTemplate";
import Make from "./old/Make";

function testMake() {
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
}

//////////////////////////
function testResolver() {
  resolveVar("bla.blubb[5][foo]");
}
/////////////////////////////////

async function testDE() {
  const tjs = TargetMap.global("./build/test.js", FilesystemTarget)!;
  tjs.add_dependencies(["./src/test.ts", "./src/Make.ts"]);
  tjs.set_recipe(async (target) => {
    log({ target });
  });
  log({ TargetMap, tjs });
  const b = new Builder();
  b.on("error", (e) => {
    error({ e });
  });
  const r2 = b.build("./build/test.js", 9);
  log({ b, r2 });
  try {
    const r3 = await r2;
    log({ r3 });
  } catch (e) {
    error({ e, from: e.stack });
  }
}
try {
  setDEBUG(true);
  testDE();
} catch (e) {
  error({ e });
}
