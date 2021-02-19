import bodyParser from "body-parser";
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


ipfsRouter.use(bodyParser.json({ type: ["application/json"] }));
ipfsRouter.use(bodyParser.text({ type: ["text/plain"] }));

ipfsRouter.get("/*", async (req, res, _next): Promise<any> => {
  const path = `/ipfs/${req.path.replace(/^\//, "")}`;
  log.info(`Getting path ${path} via ${req.method} to IPFS daemon`);
  let output = "";
  const list = [];
  try {
    for await (const chunk of ipfs.ls(path)) {
      list.push(chunk.name);
    }
    for await (const chunk of ipfs.cat(path)) {
      output += arrToString(chunk);
    }
  } catch (e) {
    if (e.message === "this dag node is a directory") {
      log.info(`Got list of ${list.length} file from ${path}`);
      return res.status(200).json(list);
    }
    log.warn(e.message);
    return res.status(500).send(e.message);
  }
  log.info(`Got ${output.length} chars of contents from ${path}`);
  return res.status(200).send(output);
});

ipfsRouter.post("/", async (req, res, _next): Promise<any> => {
  log.info(`POSTing path ${req.path} w data "${req.body}"`);
  try {
    const result = await ipfs.add(req.body, { pin: true });
    log.info(result, "Added file to ipfs, result:");
    return res.send(`/ipfs/${result.path}`);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});
