import express from "express";

import { env } from "../env";
import { logger } from "../utils";

import { getCommit, readFile, resolveRef } from "./utils";

export const gitRouter = express.Router();

const log = logger.child({ module: "GitRead" });

export const getConfig = async (req, res, _): Promise<void> => {
  res.json({
    commit: await resolveRef(env.branch),
    branch: env.branch,
  });
};

export const getFile = async (req, res, next): Promise<void> => {
  const { ref } = req.params;
  const filepath = req.path.replace(`/${ref}/`, "");
  log.info(`Returning content at ref ${ref} and path ${filepath}`);
  try {
    const commit = await getCommit(ref);
    const content = await readFile(ref, filepath);
    log.info(`Returning ${content.length} chars of content for ${filepath}`);
    res.status(200).json({
      author: commit.committer.name,
      timestamp: commit.committer.timestamp,
      content,
    });
  } catch (e) {
    log.warn(`Failed to read ${filepath} on ref ${ref}: ${e.message}`);
    next();
  }
};
