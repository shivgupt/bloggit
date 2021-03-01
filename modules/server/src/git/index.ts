import express from "express";

import { logger } from "../utils";

import { edit } from "./edit";
import { history } from "./history";
import { execPackService } from "./pack";
import { pushToMirror } from "./push";
import { getConfig, getFile } from "./read";

export const gitRouter = express.Router();

const log = logger.child({ module: "GitRouter" });

gitRouter.get("/info/refs", async (req, res) => {
  const service = req?.query?.service?.toString() || "";
  try {
    const response = await execPackService(service);
    res.setHeader("content-type", `application/x-${service}-advertisement`);
    log.info(`Sending ${response.length} bytes of ref info`);
    res.send(response);
  } catch (e) {
    log.error(`Git ref info failed: ${e.message}`);
    return res.status(500).send(e.message);
  }
});

gitRouter.post(["/git-receive-pack", "/git-upload-pack"], async (res, req) => {
  const service = req.path.split("/").pop();
  try {
    const response = await execPackService(service, req.body);
    log.info(`Sending ${response.length} bytes of pack response`);
    res.send(response);
  } catch (e) {
    log.error(`Git ${service} service failed: ${e.message}`);
    return res.status(500).send(e.message);
  }
  if (service === "git-receive-pack") {
    await pushToMirror();
  }
});

gitRouter.post("/edit", async (req, res) => {
  try {
    return res.json(await edit(req.body));
  } catch (e) {
    log.error(`Git edit failed: ${e.message}`);
    return res.status(500).send(e.message);
  }
});

gitRouter.get("/history/:slug", async (req, res) => {
  try {
    return res.status(200).json(await history(req.path.replace(`/history/`, "")));
  } catch (e) {
    log.warn(e.message);
    return res.status(200).json([]);
  }
});

gitRouter.get("/config", getConfig);
gitRouter.get("/:ref/*", getFile);
