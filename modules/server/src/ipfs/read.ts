import { getContentType, logger } from "../utils";

import { ipfs } from "./utils";

export type IpfsRead = {
  contentType: string;
  content: Buffer | string | string[] | object;
};

const log = logger.child({ module: "IpfsRouter" });

export const read = async (path: string): Promise<IpfsRead> => {
  let content: Buffer;
  const list = [];
  try {
    for await (const chunk of ipfs.ls(path)) {
      list.push(chunk.name);
    }
    log.debug(`Got list of ${list.length} files: ${list}`);
    const chunks = [];
    for await (const chunk of ipfs.cat(path)) {
      chunks.push(chunk);
    }
    content = chunks.reduce((acc, cur) => Buffer.concat([acc, cur]), Buffer.from([]));
  } catch (e) {
    if (e.message === "this dag node is a directory") {
      log.info(`Returning list of ${list.length} files from given directory`);
      return { contentType: "application/ls", content: list };
    }
    throw new Error(e); // bubble error up to caller if we can't read file or dir
  }
  let contentType = getContentType(content);
  if (contentType !== "unknown") {
    log.info(`Returning ${content.length} bytes of ${contentType} content`);
    return { contentType, content };
  } else {
    log.info(`${contentType} content type from ${content.slice(0, 16).toString("hex")}`);
  }
  const text = content.toString("utf8");
  try {
    const json = JSON.parse(text);
    contentType = "application/json";
    log.info(`Returning ${text.length} chars of ${contentType} content`);
    return { contentType, content: json };
  } catch (e) {
    log.warn(e.message);
    log.info(`Returning ${text.length} chars of text content`);
    return { contentType: "text/plain", content: text };
  }
};
