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
  const path = `${req.path.replace(/^\//, "")}`;
  let id;
  try {
    id = await ipfs.id();
  } catch (e) {
    log.warn(e.message);
    return res.send("NOT OK");
  }
  log.info(id, `Getting path ${path} via ${req.method} to IPFS daemon w id:`);
  try {
    const result = await ipfs.cat(path);
    log.info(`Got contents for file at ${path}: "${arrToString(result)}"`);
  } catch (e) {
    log.warn(e.message);
  }
  return res.send("OK");
});

ipfsRouter.post("/", async (req, res, _next): Promise<any> => {
  log.info(`POSTing path ${req.path} w data "${req.body}"`);
  const result = await ipfs.add(req.body, { pin: true });
  log.info(result, "Added file to ipfs, result:");
  return res.send("OK");
});
