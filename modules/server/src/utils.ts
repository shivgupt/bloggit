import { Readable } from "stream";

import pino from "pino";

import { env } from "./env";

export const wait = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export const logger = pino({ level: env.logLevel });

export const stringToStream = (str: string): Readable => Readable.from([str]);

export const streamToString = (stream: Readable): Promise<string> => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

export const bufferToStream = (buf: Buffer): Readable => Readable.from(buf);

export const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};
