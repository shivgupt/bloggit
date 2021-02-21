import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts, resolveRef } from "./utils";

const log = logger.child({ module: "GitHistory" });

const toISO = (secs: number): string => (new Date(Math.round(secs * 1000))).toISOString();

type HistoryResult = Array<{
  commit: string;
  timestamp: string;
}>;

// Return an array of all commits w/in which the given filepath was modified
export const history = async (req, res, _): Promise<any> => {
  const filepath = req.path.replace(`/history/`, "");
  const output = [] as HistoryResult;

  const latestCommit = await resolveRef(env.branch);
  let latestBlob;
  try {
    latestBlob = (await git.readBlob({ ...gitOpts, oid: latestCommit, filepath })).oid;
  } catch (e) {
    log.warn(e.message);
    return res.status(200).json(output);
  }

  const commits = await git.log({ ...gitOpts, ref: env.branch });
  log.info(`Scanning ${commits.length} commits searching for changes to ${filepath}`);

  let newFilepath = filepath;
  let prevBlob = latestBlob;
  let prevCommit = latestCommit;
  for (const commit of commits) {
    log.debug(`Checking commit from ${toISO(commit.commit.committer.timestamp)}`);
    try {
      const blob = await git.readBlob({ ...gitOpts, oid: commit.oid, filepath: newFilepath });
      if (blob.oid !== prevBlob) {
        log.info(`${newFilepath} was updated between ${prevCommit} and ${commit.oid}`);
        output.push({ commit: prevCommit, timestamp: toISO(commit.commit.committer.timestamp) });
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
            output.push({
              commit: prevCommit,
              timestamp: toISO(commit.commit.committer.timestamp),
            });
          }
          return blob.oid;
        },
      });
      if (!newFilepathFlag) {
        log.info(`File at ${newFilepath} doesn't appear to have been renamed. Done searching`);
        break;
      }
    }
    prevCommit = commit.oid;
  }

  return res.status(200).json(output);
};
