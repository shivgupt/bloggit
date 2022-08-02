import { ReadResponse, RefResponse } from "@bloggit/types";
import express from "express";

import { env } from "../env";
import { logger } from "../utils";

import { getCommit, readFile, resolveRef } from "./utils";

export const gitRouter = express.Router();

const log = logger.child({ module: "GitRead" });

export const getRef = async (): Promise<RefResponse> => ({
  branch: env.branch,
  commit: await resolveRef(env.branch),
});

export const getFile = async (ref: string, filepath: string): Promise<ReadResponse> => {
  if (typeof ref !== "string") throw new Error(`Invalid ref`);
  if (typeof filepath !== "string") throw new Error(`Invalid filepath`);
  const commit = await getCommit(ref);
  const content = await readFile(ref, filepath);
  log.info(`Returning ${content.length} chars of text from ${filepath}`);
  return {
    author: commit.committer.name,
    timestamp: commit.committer.timestamp,
    content,
  };
};
