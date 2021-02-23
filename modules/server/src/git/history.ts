import { env } from "../env";
import { logger } from "../utils";

import { getCommit, getPrevCommits, getFileOid, slugToPath } from "./utils";
import { HistoryResult, DateString } from "./types";

const log = logger.child({ module: "GitHistory" });

const toISO = (secs: number): DateString => (new Date(secs * 1000)).toISOString();

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

// Return an array of all commits w/in which the given slug was modified
export const history = async (req, res, _): Promise<any> => {
  try {
    const slug = req.path.replace(`/history/`, "");
    const ref = req.query.startRef || env.branch;
    const output = [] as HistoryResult;
    const latestCommit = await getCommit(ref);

    let prevPath = await slugToPath(ref, slug);
    let prevOid = await getFileOid(ref, prevPath);
    let prevCommit = latestCommit.oid;
    let prevTimestamp = earliest(latestCommit.committer.timestamp);

    const commits = await getPrevCommits(ref);
    log.info(`Scanning ${commits.length} commits searching for changes at slug ${slug}`);
    for (const newCommit of commits) {
      log.debug(`Checking ${prevPath} on ${newCommit.oid.substring(0, 8)}`);
      const newPath = await slugToPath(newCommit.oid, slug);
      if (newPath && prevPath && newPath !== prevPath) {
        log.info(`${newPath} was renamed to ${prevPath} on ${prevCommit}`);
      }
      // If the contents at this path have changed, record an update
      const newOid = await getFileOid(newCommit.oid, newPath);
      if (prevOid && !newOid) {
        log.info(`${prevPath} was published on ${prevCommit}`);
        output.push({ path: prevPath, commit: prevCommit, timestamp: toISO(prevTimestamp) });
      } else if (!prevOid && newOid) {
        log.info(`${newPath} was removed on ${prevCommit}`);
      } else if (newOid !== prevOid) {
        log.info(`${newPath} was updated on ${prevCommit}`);
        output.push({ path: prevPath, commit: prevCommit, timestamp: toISO(prevTimestamp) });
      }
      prevPath = newPath;
      prevCommit = newCommit.oid;
      prevOid = newOid;
      prevTimestamp = earliest(newCommit.committer.timestamp, prevTimestamp);
    }
    return res.status(200).json(output);

  } catch (e) {
    log.warn(e.message);
    return res.status(200).json([]);
  }
};
