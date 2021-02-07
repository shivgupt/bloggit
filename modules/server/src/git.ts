import fs from "fs";
import path from "path";

import express from "express";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";

import { env } from "./env";

export const gitRouter = express.Router();

git.clone({
  fs,
  http,
  dir: path.normalize("/blog-content"),
  url: env.contentRepo,
})
  .then(res => console.log(`Git clone result: ${res}`))
  .catch(e => console.log(`Git clone error: ${e}`));

gitRouter.get("/", (req, res): void => {
  console.log(`git getting path ${req.path}`);
  res.json({ status: "git is ok" });
});

gitRouter.get("/main", (req, res): void => {
  console.log(`git getting main branch file at ${req.path}`);
  res.json({ status: "git is at main" });
});
