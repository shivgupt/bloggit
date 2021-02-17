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
  const { branch, mirrorKey, mirrorRef, mirrorUrl } = env;
  if (mirrorUrl && mirrorKey) {

    // Manually check whether there's anything we need to push
    // a la https://github.com/isomorphic-git/isomorphic-git/issues/398#issuecomment-742798499
    const remote = `refs/remotes/${mirrorRef}/${branch}`;
    const remoteHash = await resolveRef(remote);
    log.info(`${remote} is on ${remoteHash}`);

    const local = `refs/heads/${branch}`;
    const localHash = await resolveRef(local);
    log.info(`${local} is on ${localHash}`);

    if (localHash === remoteHash) {
      log.info(`Nothing to push`);
      return;
    }

    log.info(`Pushing ${localHash} to ${remote} at ${mirrorUrl}`);
    await git.push({
      ...gitOpts,
      http,
      remote: mirrorRef,
      url: mirrorUrl,
      onAuth: (url?: string, other?: any) => {
        log.info(`Auth triggered for ${mirrorRef} at ${url} & other=${JSON.stringify(other)}`);
        return({ password: mirrorKey });
      },
      onAuthFailure: (url?: string, other?: any) => {
        log.warn(`Failed to auth w ${mirrorRef} at ${url} & creds ${JSON.stringify(other)}`);
      },
      onAuthSuccess: (url?: string) => {
        log.info(`Successfully authenticated w ${mirrorRef} at ${url}`);
      },
      onMessage: (msg: string) => {
        log.info(`Received message from ${mirrorRef} at ${mirrorUrl}: ${msg}`);
      },
      onProgress: (progress: any) => {
        log.info(`Progress pushing to ${mirrorUrl}: ${JSON.stringify(progress)}`);
      },
    }).catch(e => log.error(e.message));
  }
};
