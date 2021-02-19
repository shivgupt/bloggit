import express from "express";
import ipfsClient from "ipfs-client";

import { env } from "./env";
import { arrToString, logger } from "./utils";

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
  const content = [];
  const list = [];
  try {
    for await (const chunk of ipfs.ls(path)) {
      list.push(chunk.name);
    }
    log.debug(`Got list of ${list.length} files: ${list}`);
    for await (const chunk of ipfs.cat(path)) {
      content.push(chunk);
    }
  } catch (e) {
    if (e.message === "this dag node is a directory") {
      log.info(`Returning list of ${list.length} files from given directory`);
      return res.status(200).json(list);
    }
    log.error(e);
    return res.status(500).send(e.message);
  }
  try {
    let text = "";
    for (const chunk of content) {
      text += arrToString(chunk);
    }
    log.info(`Returning ${text.length} chars of content`);
    return res.status(200).send(text);
  } catch (e) {
    log.warn(e.message);
    let bytes = Buffer.from([]);
    for (const chunk of content) {
      bytes = Buffer.concat([bytes, chunk]);
    }
    log.info(`Returning ${bytes.length} bytes of content`);
    return res.status(200).send(bytes);
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
