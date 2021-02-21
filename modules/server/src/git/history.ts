import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts, resolveRef } from "./utils";

const log = logger.child({ module: "GitHistory" });

type HistoryResult = Array<{ commit: string; timestamp: string; }>;
type DateString = string; // in ISO format

const toISO = (secs: number): DateString => (new Date(secs * 1000)).toISOString();

// Timestamp MUST increase at every commit. If it doesn't, use the prev's timestamp instead
const earliest = (current: number, _prev?: number): number => {
  const now = Math.round(Date.now() / 1000); // all math is done w units of seconds instead of ms
  const prev = _prev || now;
  if (prev > now) {
    log.error(`prev timestamp ${toISO(prev)} is ahead of current time ${toISO(now)}`);
  }
  if (current > prev) {
    log.warn(`Invalid timestamp: ${toISO(current)} using prev time instead: ${toISO(prev)}`);
    return prev;
  }
  return current;
};


// Return an array of all commits w/in which the given filepath was modified
export const history = async (req, res, _): Promise<any> => {
  const filepath = req.path.replace(`/history/`, "");
  const output = [] as HistoryResult;

  const latestCommit = await git.readCommit({
    ...gitOpts,
    oid: await resolveRef(env.branch),
  });
  let latestBlob;
  try {
    latestBlob = (await git.readBlob({ ...gitOpts, oid: latestCommit.oid, filepath })).oid;
  } catch (e) {
    log.warn(e.message);
    return res.status(200).json(output);
  }

  const commits = await git.log({ ...gitOpts, ref: env.branch });
  log.info(`Scanning ${commits.length} commits searching for changes to ${filepath}`);

  let newFilepath = filepath;
  let prevBlob = latestBlob;
  let prevCommit = latestCommit.oid;
  let prevTimestamp = earliest(latestCommit.commit.committer.timestamp);
  for (const commit of commits) {
    log.debug(`Checking commit from ${toISO(commit.commit.committer.timestamp)}`);
    try {
      const blob = await git.readBlob({ ...gitOpts, oid: commit.oid, filepath: newFilepath });
      if (blob.oid !== prevBlob) {
        log.info(`${newFilepath} was updated between ${prevCommit} and ${commit.oid}`);
        output.push({ commit: prevCommit, timestamp: toISO(prevTimestamp) });
      }
      prevBlob = blob.oid;
    } catch (e) {
      log.debug(e.message);
      log.info(`${newFilepath} not found at ${commit.oid}, checking to see if it was renamed..`);
      let newFilepathFlag = false;
      await git.walk({
        ...gitOpts,
        trees: [git.TREE({ ref: commit.oid })],
        map: async (path: string, [entry]) => {
          if (newFilepathFlag) return null; // Stop searching once we detect a rename
          if (await entry.type() !== "blob") return "dir"; // skip checking directories
          const blob = await git.readBlob({ ...gitOpts, oid: commit.oid, filepath: path });
          if (blob.oid === prevBlob) {
            log.info(`Rename from ${path} to ${newFilepath} detected!`);
            newFilepath = path;
            newFilepathFlag = true;
            output.push({ commit: prevCommit, timestamp: toISO(prevTimestamp) });
          }
          return blob.oid;
        },
      });
      if (!newFilepathFlag) {
        log.info(`File at ${newFilepath} wasn't renamed, it was probably created here.`);
        output.push({ commit: prevCommit, timestamp: toISO(prevTimestamp) });
        break;
      }
    }
    prevCommit = commit.oid;
    prevTimestamp = earliest(commit.commit.committer.timestamp, prevTimestamp);
  }

  return res.status(200).json(output);
};
