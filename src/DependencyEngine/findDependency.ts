import { access } from "fs/promises";
import { FilesystemTarget } from "./FilesystemTarget";
import { DEBUG, log } from "./Log";
import { Target } from "./Target";
import { TargetMap } from "./TargetMap";

export async function findDependency(target: string): Promise<Target> {
  if (DEBUG) log({ target });
  const targetObj = TargetMap.global(target, null);
  if (targetObj) return targetObj;
  else {
    if (target[0] === "/") {
      try {
        await access(target);
        return TargetMap.global(target, FilesystemTarget)!;
      } catch (error) {
        throw new Error(`No rule to make target '${target}'\n${error}`);
      }
    }
    throw new Error(`No rule to make target '${target}'\n`);
  }
}
