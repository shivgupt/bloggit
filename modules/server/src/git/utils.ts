import fs from "fs";
import path from "path";

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

//https://stackoverflow.com/a/43934805
export const strToArray = (str: string): Uint8Array => {
  const utf8Encoded = unescape(encodeURIComponent(str));
  return new Uint8Array(utf8Encoded.split("").map(c => c.charCodeAt(0)));
};
export const arrToString = (arr: Uint8Array): string => {
  const utf8String = Array.from(arr).map(item => String.fromCharCode(item)).join("");
  return decodeURIComponent(escape(utf8String));
};
