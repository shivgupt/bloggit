import pino from "pino";

import { env } from "./env";

export const wait = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export const logger = pino({ level: env.logLevel });

// Convert between utf8-encoded strings and Uint8Arrays
// A la https://stackoverflow.com/a/43934805
export const strToArray = (str: string): Uint8Array => {
  const utf8Encoded = unescape(encodeURIComponent(str));
  return new Uint8Array(utf8Encoded.split("").map(c => c.charCodeAt(0)));
};
export const arrToString = (arr: Uint8Array): string => {
  const utf8String = Array.from(arr).map(item => String.fromCharCode(item)).join("");
  return decodeURIComponent(escape(utf8String));
};
