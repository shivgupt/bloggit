import fs from "fs";
import path from "path";
import { Readable } from "stream";

import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

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

// Convert between utf8-encoded strings and Uint8Arrays
// A la https://stackoverflow.com/a/43934805
export const strToArray = (str: string): Uint8Array => {
  const utf8Encoded = unescape(encodeURIComponent(str));
  return new Uint8Array(utf8Encoded.split("").map(c => c.charCodeAt(0)));
};
export const arrToString = (arr: Uint8Array): string => {
  const utf8String = Array.from(arr).map(item => String.fromCharCode(item)).join("");
  return decodeURIComponent(escape(utf8String));
};

export type GitObjectType = "blob" | "tree" | "commit";
export type GitTreeEntry = {
  mode: string;
  path: string;
  oid: string;
  type: GitObjectType;
};
export type GitTree = GitTreeEntry[];

export const writeBlob = async (
  filepath: string,
  content: string,
  latestCommit?: string,
): Promise<GitTreeEntry> => {
  const blobHash = await git.hashBlob({ object: strToArray(content) });
  const log = logger.child({ module: "WriteBlob" });
  const filename = filepath.split("/").pop();
  let blob;
  try {
    blob = await git.readBlob({ ...gitOpts, oid: latestCommit, filepath });
    if (arrToString(blob.blob) !== content) {
      throw new Error(`Found existing blob but the contents differ`);
    }
  } catch (e) {
    log.info(e.message);
    blob = {
      oid: await git.writeBlob({ ...gitOpts, blob: strToArray(content) }),
      blob: blobHash.object,
    };
  }
  return { mode: "100644", oid: blob.oid, type: "blob", path: filename };
};

export const printTree = async (oid: string, indent = 0): Promise<void> => {
  const tree = await git.readTree({ ...gitOpts, oid });
  for (const entry of tree.tree) {
    if (entry.type === "blob") {
      logger.debug(`${"  ".repeat(indent)}- ${entry.path} ${entry.oid}`);
    } else if (entry.type === "tree") {
      logger.info(` ${"  ".repeat(indent)}- ${entry.path} ${entry.oid}`);
      await printTree(entry.oid, indent + 1);
    }
  }
};
