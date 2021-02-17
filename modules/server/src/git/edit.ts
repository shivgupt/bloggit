import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { pushToMirror } from "./push";
import {
  GitObjectType,
  GitTree,
  gitOpts,
  resolveRef,
  writeBlob,
} from "./utils";

const log = logger.child({ module: "GitRouter" });

// Roughly based on https://stackoverflow.com/a/25556917
export const edit = async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.warn(`Git edit failure: ${e}`);
    res.status(500).send(e);
  };
  if (!req.body) {
    return err("Body Required");
  }

  if (!req.body.length) {
    return err("Body Malformed");
  }

  type GitEdit = { path: string, content: string };
  const pendingEdits = [] as GitEdit[];
  for (const edit of req.body) {
    if (typeof edit.path !== "string" || typeof edit.content !== "string") {
      return err("Body Malformed");
    }
    pendingEdits.push({ path: edit.path, content: edit.content });
  }
  log.info(`Pending edits: ${JSON.stringify(pendingEdits)}`);

  const latestCommit = await resolveRef(env.branch);
  const tree = (await git.readTree({ ...gitOpts, oid: latestCommit })).tree;
  const treeType = "tree" as GitObjectType;

  log.info(tree, `Editing on top of root tree at commit ${latestCommit}`);

  // Read trees to determine the list of subTrees that need to be edited to insert our new file
  let rootTreeOid;
  for (const edit of pendingEdits) {
    const newBlob = await writeBlob(edit.path, edit.content, latestCommit);
    log.info(`Wrote new blob: ${JSON.stringify(newBlob)}`);
    const subTrees = [tree] as Array<GitTree | string>;

    // Split the path into an array of subdirs (omitting the filename)
    const filename = edit.path.includes("/") ? edit.path.split("/").pop() : edit.path;
    const dirs = edit.path.split("/").reverse().slice(1).reverse();

    // Read through the subTrees to determine which ones needs to be updated
    for (const dir of dirs) {
      const absoluteDir = dirs.slice(0, dirs.indexOf(dir)).concat([dir]).join("/");
      log.info(`Processing dir "${dir}" (at absolute path "${absoluteDir}")`);
      const subTree = subTrees[subTrees.length - 1] as GitTree;
      if (typeof subTree === "string") {
        log.info(`Dir ${dir} represents a brand new subTree`);
        subTrees.push(dir);
        continue;
      }
      const nodeIndex = subTree.findIndex(entry => entry.type === treeType && entry.path === dir);
      if (nodeIndex >= 0) {
        log.info(`Dir ${dir} already exists on subTree`);
        subTrees.push((await git.readTree({
          ...gitOpts,
          oid: latestCommit,
          filepath: absoluteDir,
        })).tree);
      } else {
        log.info(`Dir ${dir} does NOT exist on subTree, pushing new entry with "tbd" oid`);
        subTree.push({
          mode: "040000",
          path: dir,
          oid: "tbd",
          type: treeType,
        });
        subTree.sort((e1, e2) => e1.path < e2.path ? -1 : 1);
        subTrees.push(dir);
      }
    }

    // Given the list of subTrees that need to change, write updates to each of them
    let prevOid = newBlob.oid;
    let prevDir = dirs[dirs.length - 1];
    for (const maybeSubTree of subTrees.reverse()) {
      if (typeof maybeSubTree === "string") {
        const dirName = maybeSubTree as string;
        if (prevOid === newBlob.oid) {
          const newTree = [newBlob];
          prevOid = await git.writeTree({ ...gitOpts, tree: newTree });
          log.info(`Wrote new subTree for new file: ${JSON.stringify(newTree)} w oid ${prevOid}`);
          continue;
        }
        const newTree = [{ mode: "040000", path: prevDir, oid: prevOid, type: treeType }];
        prevOid = await git.writeTree({ ...gitOpts, tree: newTree });
        prevDir = dirName;
        log.info(`Wrote new subTree for ${dirName}: ${JSON.stringify(newTree)} w oid ${prevOid}`);
      } else {
        const subTree = maybeSubTree as GitTree;
        const index = subTree.findIndex(entry => entry.type === treeType && entry.oid === "tbd");
        if (index >= 0) {
          subTree[index].oid = prevOid;
          prevOid = await git.writeTree({ ...gitOpts, tree: subTree });
          log.info(`Wrote subtree w new dir ${JSON.stringify(subTree[index])} w oid ${prevOid}`);
        } else {
          const index = subTree.findIndex(e => e.path === filename);
          if (index < 0) {
            return err(`Well THAT'S not supposed to happen...`);
          }
          subTree[index] = newBlob;
          prevOid = await git.writeTree({ ...gitOpts, tree: subTree });
          log.info(`Wrote subtree w new file ${JSON.stringify(subTree[index])} w oid ${prevOid}`);
        }
      }
    }
    rootTreeOid = prevOid;
    log.info(`New root tree oid: ${rootTreeOid}`);
  }

  log.info(tree, `Final root tree w oid ${rootTreeOid}`);

  const committer = {
    name: "server",
    email: "server@localhost.com",
    timestamp: Math.round(Date.now()/1000),
    timezoneOffset: 0,
  };
  const commitHash = await git.writeCommit({ ...gitOpts, commit: {
    message: `update files via http`,
    tree: rootTreeOid,
    parent: [latestCommit],
    author: committer,
    committer,
  } });
  log.info(`Wrote new commit w hash: ${commitHash}`);

  const ref = `refs/heads/${env.branch}`;

  if (await resolveRef(env.branch) !== latestCommit) {
    return err(`Latest commit on ${env.branch} was updated mid-edit`);
  }

  await git.writeRef({
    ...gitOpts,
    force: true,
    ref,
    value: commitHash,
  });
  log.info(`Wrote new ref, pointing ${env.branch} at ${commitHash}`);

  res.json({ status: "success", newCommit: commitHash });
  await pushToMirror();
  return;
};
