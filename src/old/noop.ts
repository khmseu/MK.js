import { ErrorFunction } from "./ErrorFunction";

export function noop(done: ErrorFunction) {
  done(undefined);
}
