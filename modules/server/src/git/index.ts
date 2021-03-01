import express from "express";

import { logger } from "../utils";

import { edit } from "./edit";
import { history } from "./history";
import { getRefInfo, pack } from "./pack";
import { getConfig, getFile } from "./read";

export const gitRouter = express.Router();

const log = logger.child({ module: "GitRouter" });

gitRouter.get("/info/refs", getRefInfo);
gitRouter.post(["/git-receive-pack", "/git-upload-pack"], pack);

gitRouter.post("/edit", async (req, res) => {
  try {
    return res.json(await edit(req.body));
  } catch (e) {
    log.error(`Git edit failed: ${e.message}`);
    return res.status(500).send(e.message);
  }
});

gitRouter.get("/history/:slug", history);

gitRouter.get("/config", getConfig);
gitRouter.get("/:ref/*", getFile);
