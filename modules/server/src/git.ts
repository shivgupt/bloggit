import fs from "fs";
import path from "path";

import express from "express";
import git from "isomorphic-git";

export const gitRouter = express.Router();

const gitOpts = { fs, dir: path.normalize("/blog-content") };

gitRouter.get("/:ref/:category/:file", async (req, res, next): Promise<void> => {
  const { ref: givenRef, category, file } = req.params;
  const filepath = `${category}/${file}`;
  let ref;
  try {
    ref = await git.expandOid({ ...gitOpts, oid: givenRef });
  } catch (e) {
    console.log(`Failed to expand oid ${givenRef}: ${e.message}`);
    try {
      console.log(`Trying to expand given ref: ${givenRef}`);
      ref = await git.resolveRef({ ...gitOpts, ref: givenRef });
    } catch (e) {
      console.log(`Failed to resolve ref ${givenRef}: ${e.message}`);
      return next();
    }
  }
  console.log(`Expanded given ref "${givenRef}" to "${ref}"`);

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
    next();
  }

});
