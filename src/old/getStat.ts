import { stat } from "fs";
import { DEBUG, log } from "../DependencyEngine/Log";
import { CallbackFunction } from "./CallbackFunction";
import { isPhony } from "./isPhony";

export function getStat(target: string, callback: CallbackFunction) {
  if (isPhony(target)) {
    if (DEBUG) log({ target: [null, null] });
    callback(null, null);
    return;
  }
  stat(target, function (err, stat) {
    if (err) {
      if (DEBUG) log({ target: [err, null] });
      callback(err, null);
    } else {
      if (DEBUG) log({ target: [null, stat] });
      callback(null, stat);
    }
  });
}
