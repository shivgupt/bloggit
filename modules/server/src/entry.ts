import express from "express";

import { authRouter } from "./auth";
import { env } from "./env";
import { gitRouter } from "./git";
import { logger } from "./utils";

const log = logger.child({ module: "Entry" });

log.info(env, `Starting server in env:`);

const app = express();

////////////////////////////////////////
/// Begin Pipeline

app.use((req, res, next) => {
  const query = req.query && Object.keys(req.query).length > 0
    ? `?${Object.entries(req.query).map(([key, val]) => `${key}=${val}`).join("&")}`
    : "";
  log.info(req.headers, `=> ${req.method} ${req.path}${query}`);
  next();
});

app.use(authRouter);

app.use("/git", gitRouter);

app.use((req, res) => {
  log.info("404: Not Found");
  res.status(404).send("Not Found");
});

/// End Pipeline
////////////////////////////////////////

app.listen(env.port, () => log.info(`Listening on port ${env.port}!`));
