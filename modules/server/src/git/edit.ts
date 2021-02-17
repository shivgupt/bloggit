import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { pushToMirror } from "./push";
import {
  GitObjectType,
  GitTree,
  gitOpts,
  printTree,
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
  for (const edit of req.body) {
    if (typeof edit.path !== "string" || typeof edit.content !== "string") {
      return err("Body Malformed");
    }
  }
  log.info(`Pending edits: ${JSON.stringify(req.body)}`);

  const latestCommit = await resolveRef(env.branch);
  const latestTree = await git.readTree({ ...gitOpts, oid: latestCommit });
  const tree = latestTree.tree;
  const treeType = "tree" as GitObjectType;

  log.info(`Editing on top of root tree at commit ${latestCommit}`);
  await printTree(latestCommit);

  let rootTreeOid;
  for (const edit of req.body) {
    const subTrees = [tree] as Array<GitTree | string>;

    // Split the path into an array of subdirs (omitting the filename)
    const filename = edit.path.includes("/") ? edit.path.split("/").pop() : edit.path;
    const dirs = edit.path.split("/").reverse().slice(1).reverse();
    if (filename === "" || dirs.includes("")) {
      return err(`Filename or some dir is an empty string for path ${edit.path}`);
    }

    if (edit.content === "") {
      return err(`File deletion is not implemented yet`);
    }
    const newBlob = await writeBlob(edit.path, edit.content, latestCommit);
    log.info(`Wrote new blob: ${JSON.stringify(newBlob)}`);

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
        log.info(`Dir ${dir} already exists on subTree, setting it's oid to "tbd"`);
        subTree[nodeIndex].oid = "tbd";
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
          const index = subTree.findIndex(entry => entry.path === filename);
          if (index >= 0) {
            subTree[index] = newBlob;
            prevOid = await git.writeTree({ ...gitOpts, tree: subTree });
            log.info(`Wrote tree w edited file ${JSON.stringify(subTree[index])} w oid ${prevOid}`);
          } else {
            subTree.push(newBlob);
            subTree.sort((e1, e2) => e1.path < e2.path ? -1 : 1);
            prevOid = await git.writeTree({ ...gitOpts, tree: subTree });
            log.info(`Wrote tree w new file ${JSON.stringify(subTree[index])} w oid ${prevOid}`);
          }
        }
      }
    }
    rootTreeOid = prevOid;
    log.info(`New root tree oid: ${rootTreeOid}`);
  }

  log.info(`Final root tree w oid ${rootTreeOid}`);
  await printTree(rootTreeOid);

  if (rootTreeOid === latestTree.oid) {
    return res.json({ status: "no change", newCommit: rootTreeOid });
  }

  const committer = {
    name: `${env.authUsername}@${env.domainname}`,
    email: env.email,
    timestamp: Math.round(Date.now()/1000),
    timezoneOffset: 0,
  };
  const commitHash = await git.writeCommit({ ...gitOpts, commit: {
    message: `edit ${req.body.map(e => e.path).join(", ")}`,
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
