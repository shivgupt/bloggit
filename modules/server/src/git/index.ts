import bodyParser from "body-parser";
import express from "express";

import { getRefInfo, pack } from "./backend";
import { push } from "./push";
import { getConfig, getFile } from "./read";

export const gitRouter = express.Router();

gitRouter.use(bodyParser.text({ type: ["text/plain"] }));
gitRouter.use(bodyParser.raw({ type: [
  "application/x-git-receive-pack-request",
  "application/x-git-upload-pack-request",
] }));

gitRouter.get("/info/refs", getRefInfo);
gitRouter.post(["/git-receive-pack", "/git-upload-pack"], pack);
gitRouter.post("/push/*", push);
gitRouter.get("/config", getConfig);
gitRouter.get("/:ref/*", getFile);

