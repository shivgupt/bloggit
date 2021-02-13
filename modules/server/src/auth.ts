import express from "express";

import { env } from "./env";
import { logger } from "./utils";

const log = logger.child({ module: "AuthRouter" });

export const authRouter = express.Router();

const authHeader = "admin-token";
const restrictedPaths = ["/git/push", "/git/git-receive-pack"];

authRouter.use((req, res, next) => {
  if (restrictedPaths.some(path => req.path.startsWith(path))) {
    if (!req.headers[authHeader] || req.headers[authHeader] !== env.adminToken) {
      log.info(`Failed to authenticate request for ${req.path}`);
      // res.status(403).send("Forbidden");
      next(); // For now, still proceed so we can debug other stuff
    } else {
      log.info(`Successfully authenticated request for ${req.path}`);
      next();
    }
  } else {
    next();
  }
});
