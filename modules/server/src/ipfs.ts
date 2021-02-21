import express from "express";
import ipfsClient from "ipfs-client";

import { env } from "./env";
import { getContentType, logger } from "./utils";

export const ipfsRouter = express.Router();

const log = logger.child({ module: "IpfsRouter" });

const ipfsUrl = `http://${env.ipfsUrl}`;
log.info(`Connecting to ipfsUrl=${ipfsUrl}`);

const ipfs = ipfsClient({
  // grpc: env.,
  http: ipfsUrl,
});


ipfsRouter.get("/*", async (req, res, _next): Promise<any> => {
  const path = `/ipfs/${req.path.replace(/^\//, "")}`;
  log.info(`${req.method}-ing path ${path}`);
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
    content = chunks.reduce((acc, cur) => Buffer.concat([acc, cur]));
  } catch (e) {
    if (e.message === "this dag node is a directory") {
      log.info(`Returning list of ${list.length} files from given directory`);
      return res.status(200).json(list);
    }
    log.error(e);
    return res.status(500).send(e.message);
  }
  let contentType = getContentType(content);
  if (contentType !== "unknown") {
    res.setHeader("content-type", contentType);
    log.info(`Returning ${content.length} bytes of ${contentType} content`);
    return res.status(200).send(content);
  } else {
    log.info(`${contentType} content type from ${content.slice(0, 16).toString("hex")}`);
  }
  const text = content.toString("utf8");
  try {
    const json = JSON.parse(text);
    contentType = "application/json";
    log.info(`Returning ${text.length} chars of ${contentType} content`);
    res.setHeader("content-type", contentType);
    return res.status(200).send(json);
  } catch (e) {
    log.warn(e.message);
    log.info(`Returning ${text.length} chars of text content`);
    return res.status(200).send(text);
  }
});

const upload = async (req, res, _next): Promise<any> => {
  log.info(`${req.method}-ing path ${req.path} w ${req.body.length || 0} bytes of data`);
  try {
    const result = await ipfs.add(req.body, { pin: true });
    log.info(`Added file to ipfs with CID: ${result.path}`);
    return res.send(`/ipfs/${result.path}`);
  } catch (e) {
    log.error(e.message);
    return res.status(500).send(e.message);
  }
};

ipfsRouter.put("/", upload);
ipfsRouter.post("/", upload);
