import express from "express";

import { env } from "./env";
import { gitRouter } from "./git";
import { logger } from "./utils";
import "./git-server";

const log = logger.child({ module: "Entry" });

log.info(env, `Starting server in env:`);

const app = express();

// First: Log everything
app.use((req, res, next) => { log.info(`=> ${req.path}`); next(); });

// TODO: gunzip?

// Second: return info from local git repo
app.use("/git", gitRouter);

// Last: 404
app.use((req, res) => {
  log.info("404: Not Found");
  res.status(404).send("Not Found");
});

app.listen(env.port, () => log.info(`Listening on port ${env.port}!`));
