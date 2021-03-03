import fs from "fs";
import path from "path";

import git from "isomorphic-git";

import { env } from "../env";

const gitdir = path.normalize(env.contentDir);

type GitAuthor = {
  name: string;
  email: string;
  timestamp: number;
  timezoneOffset: number;
};

export type GitCommit = {
  author: GitAuthor;
  committer: GitAuthor;
  gpgsig?: string;
  message: string;
  oid: string; // not standard
  parent: string[];
  tree: string;
};

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

export const getFileOid = async (ref: string, target: string): Promise<string | null> => {
  if (!ref || !target) return null;
  let doneFlag = false;
  return await git.walk({
    ...gitOpts,
    trees: [git.TREE({ ref })],
    map: async (path: string, [entry]): Promise<string | null> => {
      if (doneFlag || (path !== "." && !target.startsWith(path))) {
        return null; // Short-circuit walk to skip checking entry's children
      } else if (path === target) {
        doneFlag = true;
        return await entry.oid();
      } else {
        // console.log(`Looking more closely for ${target} in ${path}`);
        return ""; // Don't short-circuit subdir walking but still get filtered out by reduce
      }
    },
    reduce: async (acc, cur) => acc || cur.find(e => !!e) || null,
  });
};

export const slugToPath = async (ref: string, slug: string): Promise<string | null> => {
  try {
    const index = JSON.parse(await readFile(ref, "index.json"));
    const postData = index?.posts?.[slug];
    if (postData?.path && await getFileOid(ref, postData.path)) {
      return postData.path;
    } else if (postData?.category && await getFileOid(ref, `${postData.category}/${slug}.md`)) {
      return `${postData.category}/${slug}.md`;
    }
  } catch (e) { /* ignore errors re index.json */ }
  if (await getFileOid(ref, `${slug}.md`)) {
    return `${slug}.md`;
  }
  return null;
};

export const getCommit = async (ref: string): Promise<GitCommit> => {
  const commit = await git.readCommit({ ...gitOpts, oid: await resolveRef(ref) });
  return { oid: commit.oid, ...commit.commit };
};

const cache = {};
export const getPrevCommits = async (ref: string): Promise<Array<GitCommit>> =>
  (await git.log({ ...gitOpts, cache, ref }))
    .filter(commit => commit.oid !== ref)
    .map(commit => ({ oid: commit.oid, ...commit.commit }));

export const readFile = async (ref: string, filepath: string): Promise<string> =>
  Buffer.from((await git.readBlob({
    ...gitOpts,
    oid: await resolveRef(ref),
    filepath,
  })).blob).toString("utf8");
