import express from "express";

import { env } from "./env";
import { logger } from "./utils";

const log = logger.child({ module: "AuthRouter" });

export const authRouter = express.Router();

const authHeader = "authorization";
const authType = "Basic";
const encodedToken = Buffer.from(`${env.authUsername}:${env.authPassword}`).toString("base64");

const restrictedMethods = ["POST", "PUT"];
const restrictedPaths = ["/git/edit", "/git/git-receive-pack", "/ipfs"];

authRouter.use((req, res, next) => {
  if (restrictedPaths.includes(req.path) || restrictedMethods.includes(req.method)) {
    if (!req.headers[authHeader] || req.headers[authHeader] !== `${authType} ${encodedToken}`) {
      log.info(`Failed to authenticate request for ${req.path}`);
      res.setHeader("www-authenticate", authType);
      res.status(401).send("Unauthorized");
    } else {
      log.info(`Successfully authenticated ${req.method} to ${req.path}`);
      next();
    }
  } else {
    log.debug(`Authentication not required for ${req.method} to ${req.path}`);
    next();
  }
});
