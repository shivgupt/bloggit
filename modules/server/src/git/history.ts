import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts } from "./utils";

const log = logger.child({ module: "GitHistory" });

// Return an array of all commits w/in which the given filepath was modified
export const history = async (req, res, _): Promise<void> => {
  const filepath = req.path.replace(`/history/`, "");

  const commits = await git.log({ ...gitOpts, ref: env.branch });
  log.info(`Scanning ${commits.length} commits searching for changes to ${filepath}`);

  res.send("OK");

};
