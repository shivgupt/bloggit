import fs from "fs";
import path from "path";
import { Readable } from "stream";

import git from "isomorphic-git";
import http from "isomorphic-git/http/node";

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

//https://stackoverflow.com/a/43934805
export const strToArray = (str: string): Uint8Array => {
  const utf8Encoded = unescape(encodeURIComponent(str));
  return new Uint8Array(utf8Encoded.split("").map(c => c.charCodeAt(0)));
};
export const arrToString = (arr: Uint8Array): string => {
  const utf8String = Array.from(arr).map(item => String.fromCharCode(item)).join("");
  return decodeURIComponent(escape(utf8String));
};

export const pushToMirror = async (): Promise<void> => {
  const log = logger.child({ module: "PushToMirror" });
  if (env.mirrorUrl && env.mirrorKey) {

    // Manually check whether there's anything we need to push
    // a la https://github.com/isomorphic-git/isomorphic-git/issues/398#issuecomment-742798499
    const remoteRef = `refs/remotes/mirror/${env.defaultBranch}`;
    const remoteCommits = await git.log({
      ...gitOpts,
      depth: 1,
      ref: remoteRef,
    });
    const remoteOid = remoteCommits && remoteCommits.length ? remoteCommits[0].oid : null;
    log.info(`Remote ${remoteRef} has most recent commit oid of ${remoteOid}`);
    const localCommits = await git.log({ ...gitOpts, depth: 1 });
    const localOid = localCommits && localCommits.length ? localCommits[0].oid : null;
    if (localOid === remoteOid) {
      log.info(`Remote & local repos are up to date with commit ${localOid}, nothing to push`);
      return;
    }

    const ref = `refs/heads/${env.defaultBranch}`;
    log.info(`Pushing ref ${ref} to ${env.mirrorUrl}`);
    await git.push({
      ...gitOpts,
      http,
      remote: "mirror",
      url: env.mirrorUrl,
      onAuth: (url?: string, other?: any) => {
        log.info(`Auth triggered for mirror at ${url} & other=${JSON.stringify(other)}`);
        return({ password: env.mirrorKey });
      },
      onAuthFailure: (url?: string, other?: any) => {
        log.warn(`Failed to authenticate w mirror at ${url} & creds ${JSON.stringify(other)}`);
      },
      onAuthSuccess: (url?: string, other?: any) => {
        log.info(`Successfully authenticated w mirror at ${url} & creds ${JSON.stringify(other)}`);
      },
      onMessage: (msg: string) => {
        log.info(`Pushing to remote message: ${msg}`);
      },
      onProgress: (progress: any) => {
        log.info(`Pushing to remote progress: ${JSON.stringify(progress)}`);
      },
    }).catch(e => log.error(e.message));
  }
};
