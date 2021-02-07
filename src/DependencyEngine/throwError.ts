/**
 * so we can use this in an exception like
 * a = cond? b : throwError("not b");
 *
 * @param e the error message
 */
export function throwError<T>(e: string): T {
  throw new Error(e);
}
