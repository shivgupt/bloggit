import fs from "fs";
import path from "path";
import { Readable } from "stream";

import git from "isomorphic-git";

import { env } from "../env";

const gitdir = path.normalize(env.contentDir);

export const gitOpts = { fs, dir: gitdir, gitdir };

// Given a branch name or abreviated commit hash, return the full commit hash
export const resolveRef = async (givenRef: string): Promise<string> => {
  let ref;
  try {
    ref = await git.resolveRef({ ...gitOpts, ref: givenRef });
  } catch (e) {
    ref = await git.expandOid({ ...gitOpts, oid: givenRef });
  }
  return ref;
};

export const bufferToStream = (buf: Buffer): Readable => Readable.from(buf);
export const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};
