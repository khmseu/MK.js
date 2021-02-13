import { ActionFunction } from "./ActionFunction";
import { noop } from "./noop";
import { StringSet } from "./StringSet";

export class oTarget {
  dependsOn: StringSet = new StringSet();
  action: ActionFunction = noop;
}
