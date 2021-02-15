import express from "express";

import { env } from "./env";
import { logger } from "./utils";

const log = logger.child({ module: "AuthRouter" });

export const authRouter = express.Router();

const authHeader = "authorization";
const authType = "Basic";
const encodedToken = Buffer.from(`${env.authUsername}:${env.authPassword}`).toString("base64");
const restrictedPaths = ["/git/push", "/git/git-receive-pack"];

authRouter.use((req, res, next) => {
  if (restrictedPaths.some(path => req.path.startsWith(path))) {
    if (!req.headers[authHeader] || req.headers[authHeader] !== `${authType} ${encodedToken}`) {
      log.info(`Failed to authenticate request for ${req.path}`);
      res.setHeader("www-authenticate", authType);
      res.status(401).send("Unauthorized");
    } else {
      log.info(`Successfully authenticated request for ${req.path}`);
      next();
    }
  } else {
    next();
  }
});
