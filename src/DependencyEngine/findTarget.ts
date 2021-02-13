import { ConfigVar } from "./ConfigVar";
import { EnvironmentVar } from "./EnvironmentVar";
import { FilesystemTarget } from "./FilesystemTarget";
import { DEBUG, log } from "./Log";
import { PseudoTarget } from "./PseudoTarget";
import { Target } from "./Target";
import { TargetMap } from "./TargetMap";
import { Variable } from "./Variable";

export async function findTarget(target: string): Promise<Target> {
  if (DEBUG) log({ target });
  const targetObj = TargetMap.global(target, null);
  if (targetObj) return targetObj;
  else {
    switch (target[0]) {
      case "/":
        return TargetMap.global(target, FilesystemTarget)!;
      case ":":
        return TargetMap.global(target, PseudoTarget)!;
      case "@":
        return TargetMap.global(target, ConfigVar)!;
      case "$":
        return TargetMap.global(target, EnvironmentVar)!;
      default:
        return TargetMap.global(target, Variable)!;
    }
  }
}
