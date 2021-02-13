import { ErrorFunction } from "./ErrorFunction";

export type ActionFunction = (
  done: ErrorFunction,
  target: string,
  dependencies: string[]
) => void;
