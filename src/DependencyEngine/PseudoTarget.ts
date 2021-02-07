import { Target } from "./Target";
import { TargetMap } from "./TargetMap";

export class PseudoTarget extends Target {}

export const always = TargetMap.global(":always", PseudoTarget);
