import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { gitOpts, resolveRef, strToArray, arrToString } from "./utils";

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
  const parts = filepath.split("/");
  const dirname = parts.slice(0, parts.length - 1)[0];
  const filename = parts.slice(parts.length - 1)[0];
  const parentCommit = await resolveRef(env.defaultBranch);

  if (parts.length > 2) {
    err("Too many nested dirs, updating files more than 1 dir deep has not been implemented yet");
  }

  log.info(`Processing git push for file ${filepath} on top of commit ${parentCommit}`);
  log.info(`req.body=${req.body}`);

  // TODO: why is there a "blob {len}" prefix added to the input?
  const blobHash = await git.hashBlob({ object: strToArray(req.body) });

  let blob;
  try {
    blob = await git.readBlob({ ...gitOpts, oid: parentCommit, filepath });
    log.info(`Read existing blob: ${JSON.stringify(blob)}`);
    if (arrToString(blob.blob) !== req.body) {
      throw new Error(`Blob contents differ`);
    }
  } catch (e) {
    log.info(`Failed to read blob: ${e.message}`);
    blob = {
      oid: await git.writeBlob({ ...gitOpts, blob: strToArray(req.body) }),
      blob: blobHash.object,
    };
    log.info(`Wrote new blob: {"oid":"${blob.oid}","blob":"${arrToString(blob.blob)}"}`);
  }

  const newBlob = {
    mode: "100644",
    oid: blob.oid,
    type: "blob",
    path: filename,
  };
  log.info(`Adding new blob to tree: ${JSON.stringify(newBlob)}`);

  const tree = (await git.readTree({ ...gitOpts, oid: parentCommit })).tree;
  log.info(tree, "Read root tree:");

  let subTree;
  if (dirname) {
    const node = tree.find(element => element.type === "tree" && element.path === dirname);
    if (node) {
      log.info(`This node contains the target dir: ${JSON.stringify(node)}`);
      subTree = (await git.readTree({ ...gitOpts, oid: node.oid })).tree;
      log.info(subTree, `Found subtree:`);
    } else {
      log.info(`Node for "${dirname}" does not exist in root tree`);
      err("Missing tree node, new dir creation not implemented");
      return;
    }
  }

  let subTreeOid;
  if (subTree) {
    const target = subTree.findIndex(element => element.path === filename);
    if (target >= 0) {
      log.info(`Subtree already contains target file, updating it..`);
      subTree[target] = newBlob;
    } else {
      log.info(`Subtree does not contains target file, adding it..`);
      subTree.push(newBlob);
    }
    subTreeOid = await git.writeTree({ ...gitOpts, tree: subTree });
    log.info(`Wrote new sub tree w oid: ${subTreeOid}`);
  }

  if (dirname) {
    const target = tree.findIndex(element => element.path === dirname);
    if (target >= 0) {
      tree[target] = { mode: "040000", path: dirname, type: "tree", oid: subTreeOid };
    } else {
      err("This should never happen");
      return;
    }
  } else {
    const target = tree.findIndex(element => element.path === filename);
    if (target >= 0) {
      log.info(`Root tree already contains target file, updating it..`);
      log.info(`Old node: ${JSON.stringify(tree[target])}`);
      tree[target] = newBlob as any;
      log.info(`New node: ${JSON.stringify(tree[target])}`);
    } else {
      log.info(`Root tree does not contains target file, adding it..`);
      tree.push(newBlob as any);
    }
  }

  const rootTreeOid = await git.writeTree({ ...gitOpts, tree });
  log.info(`Wrote new root tree w oid: ${rootTreeOid}`);

  const committer = {
    name: "server",
    email: "server@localhost.com",
    timestamp: Date.now(),
    timezoneOffset: 0,
  };
  const commitHash = await git.writeCommit({ ...gitOpts, commit: {
    message: `update ${filepath} via http`,
    tree: rootTreeOid,
    parent: [parentCommit],
    author: committer,
    committer,
  } });
  log.info(`Wrote new commit w hash: ${commitHash}`);

  await git.writeRef({
    ...gitOpts,
    force: true,
    ref: `refs/heads/${env.defaultBranch}`,
    value: commitHash,
  });
  log.info(`Wrote new ref, pointing ${env.defaultBranch} at ${commitHash}`);

  res.json({
    status: "success",
  });
};
