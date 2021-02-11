import { Readable } from "stream";

export const trimSlash = (pathPart: string) => pathPart.replace(/^\/+/, "").replace(/\/+$/, "");

export const stringToStream = (str: string): Readable => Readable.from([str]);

export const streamToString = (stream: Readable): Promise<string> => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};
