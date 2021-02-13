import express from "express";
import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts, resolveRef } from "./utils";

export const gitRouter = express.Router();

const log = logger.child({ module: "GitRead" });

export const getConfig = (req, res, _): void => {
  res.json({
    defaultBranch: env.defaultBranch,
  });
};

export const getFile = async (req, res, next): Promise<void> => {
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
};
