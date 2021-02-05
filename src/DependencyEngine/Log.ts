export let DEBUG = false;

function where(top: Function | undefined) {
  const err: { stack?: string } = {};
  Error.captureStackTrace(err, top);
  return err.stack?.split("\n")[1].substr(7);
}

export function log(...args: any[]) {
  console.log(where(log), ...args);
}

export function error(...args: any[]) {
  console.error(where(error), ...args);
}
