import { Stats } from "fs";
import { Optional } from "./Optional";

export type CallbackFunction = (
  err: Optional<Error>,
  targetStat?: Optional<Stats>
) => void;
