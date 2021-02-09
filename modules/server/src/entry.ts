import express from "express";

import { env } from "./env";
import { gitRouter } from "./git";
import "./git-server";

console.log(`Starting server in env: ${JSON.stringify(env, null, 2)}`);

const app = express();

// First: Log everything
app.use((req, res, next) => { console.log(`=> ${req.path}`); next(); });

// Second: return info from local git repo
app.use("/git", gitRouter);

// Last: 404
app.use((req, res) => {
  console.log("404: Not Found");
  res.status(404).send("Not Found");
});

app.listen(env.port, () => console.log(`Listening on port ${env.port}!`));
