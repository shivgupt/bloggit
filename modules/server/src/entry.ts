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

app.use((req, res, next) => { log.info(`=> ${req.path}`); next(); });

app.use(authRouter);

app.use("/git", gitRouter);

app.use((req, res) => {
  log.info("404: Not Found");
  res.status(404).send("Not Found");
});

/// End Pipeline
////////////////////////////////////////

app.listen(env.port, () => log.info(`Listening on port ${env.port}!`));
