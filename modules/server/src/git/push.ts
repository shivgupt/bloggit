import git from "isomorphic-git";
import http from "isomorphic-git/http/node";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts, resolveRef } from "./utils";

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
  } else {
    log.warn(`mirrorUrl and/or mirrorKey is missing, not pushing updates to mirror`);
  }
};
