import git from "isomorphic-git";
import http from "isomorphic-git/http/node";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts, resolveRef } from "./utils";

export const pushToMirror = async (): Promise<void> => {
  const log = logger.child({ module: "GitPush" });
  const { branch, mirrorKey, mirrorRef, mirrorUrl } = env;
  if (!branch || !mirrorUrl || !mirrorRef || !mirrorKey) {
    log.warn(`Some mirror info is missing from the env, not pushing updates`);
    return;
  }

  // Manually check whether we need to push
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
    onAuth: (url?: string) => {
      log.info(`Auth triggered for ${mirrorRef} at ${url}`);
      return({ password: mirrorKey });
    },
    onAuthFailure: (url?: string) => {
      log.warn(`Failed to auth w ${mirrorRef} at ${url}`);
    },
    onAuthSuccess: (url?: string) => {
      log.info(`Successfully authenticated w ${mirrorRef} at ${url}`);
    },
    onMessage: (msg: string) => {
      log.info(`Received message from ${mirrorRef} at ${mirrorUrl}: ${msg}`);
    },
  }).catch(e => log.error(e.message));
};
