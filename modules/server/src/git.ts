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
    console.log(`Trying to expand given oid: ${givenRef}`);
    ref = await git.expandOid({ ...gitOpts, oid: givenRef });
  } catch (e) {
    console.log(`Failed to expand oid ${givenRef}: ${e.message}`);
    try {
      console.log(`Trying to expand given ref: ${givenRef}`);
      ref = await git.expandRef({ ...gitOpts, ref: givenRef });
    } catch (e) {
      console.log(`Failed to expand ref ${givenRef}: ${e.message}`);
    }
  }
  // does this ref exist?
  try {
    await git.checkout({
      ...gitOpts,
      dryRun: true,
      force: true,
      ref,
    });
  } catch (e) {
    console.log(`Cannot find ref ${ref}: ${e.message}`);
    return next();
  }

  console.log(`git checking out ref ${ref}`);
  // checkout this ref
  await git.checkout({
    ...gitOpts,
    force: true,
    ref,
  });

  try {
    const blob = await git.readBlob({
      ...gitOpts,
      oid: ref,
      filepath,
    });
    console.log(`got a blob object w props: ${Object.keys(blob)}`);
    const parsedBlob = Buffer.from(blob.blob).toString("utf8");
    res.status(200).send(parsedBlob);

  } catch (e) {
    console.log(`Failed to read object w oid ${ref} and filepath ${filepath}: ${e.message}`);
    next();
  }

});
