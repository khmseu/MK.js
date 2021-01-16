import Make from "./Make";

const make = new Make();
make.rule("./test.js", ["./test.ts", "./Make.ts"], (done, target, deps) => {
  console.log({ done, target, deps });
  done();
});
make.baseDir("");
make.args();
make.run("./test.js", (e) => {
  console.log({ e });
});
