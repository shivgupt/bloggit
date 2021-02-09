import fs from "fs";
import path from "path";

import express from "express";
import git from "isomorphic-git";

import { env } from "./env";

export const gitRouter = express.Router();

const gitdir = path.normalize("/blog-content.git");
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

git.listBranches({ ...gitOpts }).then(lob => console.log(`list of branches: ${lob}`));

// Second: return config if requested
gitRouter.get("/config", (req, res, _): void => {
  res.json({
    defaultBranch: env.defaultBranch,
  });
});

gitRouter.get("/:ref/*", async (req, res, next): Promise<void> => {
  const { ref: givenRef } = req.params;
  const filepath = req.path.replace(`/${givenRef}/`, "");
  let ref;
  try {
    ref = await resolveRef(givenRef);
    console.log(`Expanded given ref "${givenRef}" to "${ref}"`);
  } catch (e) {
    console.log(`Failed to resolve ref ${givenRef}`);
    return next();
  }
  try {
    const commit = (await git.readCommit({ ...gitOpts, oid: ref })).commit;
    const content = Buffer.from((await git.readBlob({
      ...gitOpts,
      oid: ref,
      filepath,
    })).blob).toString("utf8");
    console.log(`Returning ${content.length} chars of content for ${filepath}`);
    res.status(200).json({
      author: commit.committer.name,
      timestamp: commit.committer.timestamp,
      content,
    });
  } catch (e) {
    console.log(`Failed to read object w oid ${ref} and filepath ${filepath}: ${e.message}`);
    return next();
  }
});
