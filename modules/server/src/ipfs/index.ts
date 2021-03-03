import express from "express";

import { logger } from "../utils";

import { read } from "./read";
import { save } from "./save";

export const ipfsRouter = express.Router();

const log = logger.child({ module: "IpfsRouter" });

ipfsRouter.get("/*", async (req, res, _next): Promise<any> => {
  try {
    const path = `/ipfs/${req.path.replace(/^\//, "")}`;
    log.info(`${req.method}-ing path ${path}`);
    const { contentType, content } = await read(path);
    res.setHeader("content-type", contentType);
    log.info(`Returning ${contentType} content`);
    return res.status(200).send(content);
  } catch (e) {
    log.error(e);
    return res.status(500).send(e.message);
  }
});

const upload = async (req, res, _next): Promise<any> => {
  log.info(`${req.method}-ing path ${req.path} w ${req.body.length || 0} bytes of data`);
  try {
    const result = await save(req.body);
    log.info(`Added file to ipfs with path: ${result}`);
    return res.send(result);
  } catch (e) {
    log.error(e.message);
    return res.status(500).send(e.message);
  }
};

ipfsRouter.put("/", upload);
ipfsRouter.post("/", upload);
