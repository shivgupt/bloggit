import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts, getCommit, getPrevCommits, getFileOid, slugToPath } from "./utils";
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
    log.warn(`Invalid timestamp: ${toISO(current)} using prev time - 1 instead: ${toISO(newPrev)}`);
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
      log.debug(`Checking ${prevPath} on commit from ${toISO(newCommit.committer.timestamp)}`);
      // If slug stops mapping to a path, continue following the previous path
      const newPath = await slugToPath(newCommit.oid, slug) || prevPath;
      if (newPath !== prevPath) {
        log.info(`Rename from ${newPath} to ${prevPath} detected!`);
      }

      // If the contents at this path have changed, record an update
      let newOid = await getFileOid(newCommit.oid, newPath);
      if (newOid && newOid !== prevOid) {
        log.info(`${newPath} was updated between ${prevCommit} and ${newCommit.oid}`);
        output.push({ path: prevPath, commit: prevCommit, timestamp: toISO(prevTimestamp) });

      // If file contents have not changed, record new values as prev & move on
      } else if (newOid) {
        prevPath = newPath;

      // If our path doesn't map to anything, check to see if file contents exist under a new path
      } else {
        log.info(`${newPath} not found at ${newCommit.oid}, checking to see if it was renamed..`);
        let renameDetected = false;
        newOid = await git.walk({
          ...gitOpts,
          trees: [git.TREE({ ref: newCommit.oid })],
          map: async (path: string, [entry]) => {
            if (renameDetected) return null; // Stop searching once we detect a rename
            if (await entry.type() !== "blob") return ""; // continue searching past all trees
            const fileOid = await entry.oid();
            if (fileOid === prevOid) {
              renameDetected = true;
              log.info(`Rename from ${path} to ${prevPath} detected!`);
              prevPath = path;
              return fileOid;
            }
            return null;
          },
          reduce: async (acc, cur) => acc || cur.find(e => !!e) || null,
        });
        if (!renameDetected || !newOid) {
          log.info(`File at ${prevPath} wasn't renamed, it must have been created here.`);
          output.push({ path: prevPath, commit: prevCommit, timestamp: toISO(prevTimestamp) });
          break;
        } else {
          output.push({ path: prevPath, commit: prevCommit, timestamp: toISO(prevTimestamp) });
        }
      }

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
