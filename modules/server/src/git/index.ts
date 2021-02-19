import express from "express";

import { getRefInfo, pack } from "./backend";
import { edit } from "./edit";
import { getConfig, getFile } from "./read";

export const gitRouter = express.Router();

gitRouter.get("/info/refs", getRefInfo);
gitRouter.post(["/git-receive-pack", "/git-upload-pack"], pack);

gitRouter.post("/edit", edit);

gitRouter.get("/config", getConfig);
gitRouter.get("/:ref/*", getFile);
