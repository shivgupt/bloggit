import fs from "fs";
import path from "path";

import bodyParser from "body-parser";
import express from "express";
import git from "isomorphic-git";

import { env } from "./env";
import { getGitBackend } from "./git-backend";
import { logger } from "./utils";

export const gitRouter = express.Router();

const log = logger.child({ module: "GitRouter" });

const gitdir = path.normalize(env.contentDir);
const gitOpts = { fs, dir: gitdir, gitdir };

// Given a branch name or abreviated commit hash, return the full commit hash
const resolveRef = async (givenRef: string): Promise<string> => {
  let ref;
  try {
    ref = await git.resolveRef({ ...gitOpts, ref: givenRef });
  } catch (e) {
    ref = await git.expandOid({ ...gitOpts, oid: givenRef });
  }
  return ref;
};

gitRouter.use(bodyParser.raw({ type: [
  "application/x-git-receive-pack-request",
  "application/x-git-upload-pack-request",
] }));

gitRouter.get("/info/refs", async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.warn(`Git backend failure: ${e}`);
    res.status(500).send(e);
    return;
  };
  const cmd = req?.query?.service?.toString() || "";
  const response = await getGitBackend(req.path, cmd, req.body, err);
  log.info(`Successfully got ${response.length} bytes of ref info`);
  if (cmd) {
    const contentType = "application/x-" + cmd + "-advertisement";
    log.info(`setting content-type header to ${contentType}`);
    res.setHeader("content-type", contentType);
  }
  res.send(response);
});

gitRouter.post([
  "/git-receive-pack",
  "/git-upload-pack",
], async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.warn(`Git backend failure: ${e}`);
    res.status(500).send(e);
    return;
  };
  log.info(`Activating git backend for ${req.body?.length} bytes posted to ${req.path}`);
  const cmd = req?.query?.service?.toString() || "";
  const response = await getGitBackend(req.path, cmd, req.body, err);
  log.info(`Successfully got ${response.length} bytes of pack response`);
  res.send(response);
});

gitRouter.get("/config", (req, res, _): void => {
  res.json({
    defaultBranch: env.defaultBranch,
  });
});

gitRouter.get("/:ref/*", async (req, res, next): Promise<void> => {
  const { ref: givenRef } = req.params;
  const filepath = req.path.replace(`/${givenRef}/`, "");
  log.info(`Returning content at ref ${givenRef} and path ${filepath}`);
  let ref;
  try {
    ref = await resolveRef(givenRef);
    log.info(`Expanded given ref "${givenRef}" to "${ref}"`);
  } catch (e) {
    log.info(`Failed to resolve ref ${givenRef}`);
    return next();
  }
  try {
    const commit = (await git.readCommit({ ...gitOpts, oid: ref })).commit;
    const content = Buffer.from((await git.readBlob({
      ...gitOpts,
      oid: ref,
      filepath,
    })).blob).toString("utf8");
    log.info(`Returning ${content.length} chars of content for ${filepath}`);
    res.status(200).json({
      author: commit.committer.name,
      timestamp: commit.committer.timestamp,
      content,
    });
  } catch (e) {
    log.info(`Failed to read object w oid ${ref} and filepath ${filepath}: ${e.message}`);
    return next();
  }
});
