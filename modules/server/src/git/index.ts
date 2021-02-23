import express from "express";

import { edit } from "./edit";
import { history } from "./history";
import { getRefInfo, pack } from "./pack";
import { getConfig, getFile } from "./read";

export const gitRouter = express.Router();

gitRouter.get("/info/refs", getRefInfo);
gitRouter.post(["/git-receive-pack", "/git-upload-pack"], pack);

gitRouter.post("/edit", edit);

gitRouter.get("/history/*", history);

gitRouter.get("/config", getConfig);
gitRouter.get("/:ref/*", getFile);
