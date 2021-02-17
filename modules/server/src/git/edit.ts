import git from "isomorphic-git";

import { env } from "../env";
import { logger } from "../utils";

import { pushToMirror } from "./push";
import {
  strToArray,
  gitOpts,
  resolveRef,
} from "./utils";

const log = logger.child({ module: "GitRouter" });

export type GitObjectType = "blob" | "tree" | "commit";
export type GitBlobEntry = {
  mode: string;
  path: string;
  oid: string;
  type: "blob";
};
export type GitTreeEntry = {
  mode: string;
  path: string;
  oid: string;
  type: GitObjectType;
};
export type GitTree = GitTreeEntry[];

export const printTree = async (oid: string, indent = 0): Promise<void> => {
  const tree = await git.readTree({ ...gitOpts, oid });
  for (const entry of tree.tree) {
    if (entry.type === "blob") {
      logger.debug(`${"  ".repeat(indent)}- ${entry.path} ${entry.oid}`);
    } else if (entry.type === "tree") {
      logger.info(` ${"  ".repeat(indent)}- ${entry.path} ${entry.oid}`);
      await printTree(entry.oid, indent + 1);
    }
  }
};

// Roughly based on https://stackoverflow.com/a/25556917
export const edit = async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.error(`Git edit failed: ${e}`);
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

  log.info(`Editing on top of root tree at commit ${latestCommit}`);
  await printTree(latestCommit);

  let rootTreeOid;
  for (const edit of req.body) {
    // const subTrees = [tree] as Array<GitTree | string>;

    const filename = edit.path.includes("/") ? edit.path.split("/").pop() : edit.path;
    // Split the path into an array of subdirs (omitting the filename)
    const dirs = edit.path.split("/").reverse().slice(1).reverse();
    if (filename === "" || dirs.includes("")) {
      return err(`Filename or some dir is an empty string for path ${edit.path}`);
    }
    log.info(`filename: ${filename} | dirs: ${dirs}`);

    const treePath = await git.walk({
      ...gitOpts,
      trees: [git.TREE({ ref: latestCommit })],
      map: async (filepath: string, [entry]) => {
        if (filepath === ".") {
          const obj = await git.readTree({ ...gitOpts, oid: latestCommit });
          return { path: filepath, oid: obj.oid, val: obj.tree, type: "tree" };
        } else if (edit.path.startsWith(filepath)) {
          log.info(`Found the ${filepath} in ${edit.path}!`);
          const obj = await git.readObject({ ...gitOpts, oid: latestCommit, filepath });
          return { path: filepath, oid: obj.oid, val: obj.object, type: await entry.type() };
        }
        return null;
      },
      reduce: async (parent, children) => [].concat(parent, ...children),
    });

    log.info(`treePath: ${treePath.map(entry => `${entry.path} ${entry.oid.substring(0, 8)}`)}`);

    if (edit.content === "") {
      log.info(`Deleting references to ${filename}`);
      let toRemove = filename;
      let newEntry;
      for (const dir of ["."].concat(dirs).reverse()) {
        const tree = treePath.find(t => t.path.endsWith(dir))?.val || [];
        if (tree.length === 0) {
          log.warn(`No tree found for this path, moving on..`);
          toRemove = dir;
          continue;
        }
        const rmIndex = tree.findIndex(e => e.path === toRemove);
        if (rmIndex >= 0) {
          log.info(`Removing subTree[${rmIndex}] in ${dir}`);
          tree.splice(rmIndex, 1);
          toRemove = null;
        }
        if (tree.length > 0) {
          const syncIndex = tree.findIndex(e => newEntry?.path && e.path === newEntry.path);
          if (syncIndex >= 0) {
            log.info(`Replacing subTree[${syncIndex}] with entry ${JSON.stringify(newEntry)}`);
            tree[syncIndex] = newEntry;
            toRemove = null;
          }
          newEntry = {
            mode: "040000",
            oid: await git.writeTree({ ...gitOpts, tree }),
            type: "tree",
            path: dir,
          };
          toRemove = null;
        } else {
          log.info(`Nothing left in this dir, flagging it for deletion`);
          toRemove = dir;
        }
      }
      rootTreeOid = newEntry.oid;

    } else {
      const newBlobOid = await git.writeBlob({ ...gitOpts, blob: strToArray(edit.content) });
      log.info(`Wrote new blob for ${filename}: ${newBlobOid}`);
      let newEntry = { mode: "100644", oid: newBlobOid, type: "blob", path: filename };
      for (const dir of ["."].concat(dirs).reverse()) {
        const tree = treePath.find(t => t.path.endsWith(dir))?.val || [];
        log.info(`${tree.length > 0 ? "Using existing" : "Creating new"} tree for ${dir}`);
        const index = tree.findIndex(e => e.path === newEntry.path);
        if (index >= 0) {
          log.info(`Replacing subTree[${index}] with ${JSON.stringify(newEntry)}`);
          tree[index] = newEntry;
        } else {
          log.info(`Pushing new entry into tree: ${JSON.stringify(newEntry)}`);
          tree.push(newEntry);
        }
        newEntry = {
          mode: "040000",
          oid: await git.writeTree({ ...gitOpts, tree }),
          type: "tree",
          path: dir,
        };
      }
      rootTreeOid = newEntry.oid;
      log.info(`New root tree oid: ${rootTreeOid}`);
    }
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
