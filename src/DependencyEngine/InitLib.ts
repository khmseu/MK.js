import Aigle from "aigle";

function InitLib() {
  global.Promise = Aigle;
}

// interface PromiseConstructor {
// readonly [Symbol.species]: PromiseConstructor;
// }
