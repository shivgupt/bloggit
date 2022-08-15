import { HistoryResponse } from "@bloggit/types";

import { env } from "../env";
import { logger } from "../utils";

import { getCommit, getPrevCommits, getFileOid, isPublished, slugToPath } from "./utils";

const log = logger.child({ module: "GitHistory" });

const toISO = (secs: number): string => (new Date(secs * 1000)).toISOString();

// Timestamp MUST increase at every commit. If it doesn't, use the prev timestamp - 1 second
const earliest = (current: number, _prev?: number): number => {
  const now = Math.round(Date.now() / 1000); // all math is done w units of seconds instead of ms
  const prev = _prev || now;
  if (prev > now) {
    log.error(`prev timestamp ${toISO(prev)} is ahead of current time ${toISO(now)}`);
  }
  if (current > prev) {
    const newPrev = prev - 1;
    log.debug(`Invalid timestamp: ${toISO(current)} using prev time - 1: ${toISO(newPrev)}`);
    return newPrev;
  }
  return current;
};

// Return an array of all non-draft commits w/in which the given slug was modified
export const history = async (slug: string): Promise<HistoryResponse> => {
  if (typeof slug !== "string") {
    throw new Error(`Invalid slug`);
  }
  const ref = env.branch;
  const output = [] as HistoryResponse;
  const latestCommit = await getCommit(ref);
  let prevPublished = await isPublished(ref, slug);
  let prevPath = await slugToPath(ref, slug);
  let prevOid = await getFileOid(ref, prevPath);
  let prevCommit = latestCommit.oid;
  let prevTimestamp = earliest(latestCommit.committer.timestamp);
  const commits = await getPrevCommits(ref);
  log.info(`Scanning ${commits.length} commits searching for changes to slug ${slug}`);
  for (const newCommit of commits) {
    if (prevPath) {
      log.debug(`Checking ${prevPath} on ${newCommit.oid.substring(0, 8)}`);
    }
    const newPath = await slugToPath(newCommit.oid, slug);
    const newOid = await getFileOid(newCommit.oid, newPath);
    const newPublished = await isPublished(newCommit.oid, slug);
    if (newPath && prevPath && newPath !== prevPath) {
      log.info(`${newPath} was renamed to ${prevPath} on ${prevCommit}`);
    }
    // If the contents at this path have changed, record an update
    if (prevPath && prevOid && prevPublished && (!newPath || !newOid || !newPublished)) {
      log.info(`${prevPath} was published on ${prevCommit}`);
      output.push({ path: prevPath, commit: prevCommit, timestamp: toISO(prevTimestamp) });
    } else if ((!prevOid || !prevPublished) && newOid && newPublished) {
      log.info(`${newPath} was removed on ${prevCommit}`);
    } else if (
      prevPath && prevOid && prevPublished &&
      newPath && newOid && newPublished &&
      newOid !== prevOid
    ) {
      log.info(`${newPath} was updated on ${prevCommit}`);
      output.push({ path: prevPath, commit: prevCommit, timestamp: toISO(prevTimestamp) });
    }
    prevCommit = newCommit.oid;
    prevOid = newOid;
    prevPath = newPath;
    prevPublished = newPublished;
    prevTimestamp = earliest(newCommit.committer.timestamp, prevTimestamp);
  }
  return output;
};
