import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts, resolveRef } from "./utils";

const log = logger.child({ module: "GitRouter" });

// based on https://stackoverflow.com/a/25556917
// TODO: lock so simultaneous pushes proceed serially
export const push = async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.warn(`Git push failure: ${e}`);
    res.status(500).send(e);
    return;
  };
  if (!req.body) err("Body Required");

  const filepath = req.path.replace(`/push/`, "");
  log.info(`Processing git push for file ${filepath}`);
  const newBlob = await git.hashBlob({ object: req.body });
  log.info(`Creating blob from body: ${newBlob.oid}`);
  const latestCommit = await resolveRef(env.defaultBranch);
  // Reset this filepath
  await git.resetIndex({ ...gitOpts, filepath });
  const tree = (await git.readTree({ ...gitOpts, oid: latestCommit })).tree;
  log.info(tree, "tree:");
  const parts = filepath.split("/");
  const filename = parts[parts.length - 1];
  const subTrees = [];
  for (const part of parts) {
    if (part === filename) {
      // If we needed to add new folders
      if (subTrees.length > 0) {
        log.info(`Creating new folders..`);
      } else {
        log.info(`Adding file..`);
      }
    } else {
      const node = tree.find(element => element.type === "tree" && element.path === part);
      if (node) {
        log.info(node, `Found node in root tree:`);
      } else {
        log.info(`Node for ${part} does not exist in root tree`);
        subTrees.push({ mode: "040000", path: part, oid: "", type: "tree" });
      }
    }
  }
  // git.writeTree({ ...gitOpts, tree });
  res.json({
    defaultBranch: env.defaultBranch,
  });
};
