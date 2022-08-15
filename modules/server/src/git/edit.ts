import { EditRequest, EditResponse } from "@bloggit/types";
import git from "isomorphic-git";

import { env } from "../env";
import { logger, strToArray } from "../utils";

import { pushToMirror } from "./push";
import { gitOpts, resolveRef } from "./utils";

const log = logger.child({ module: "GitEdit" });

// Inspired by https://stackoverflow.com/a/25556917
export const edit = async (editReq: EditRequest): Promise<EditResponse> => {
  if (!editReq || !editReq.length) {
    throw new Error("Invalid edit request");
  }
  for (const edit of editReq) {
    if (typeof edit.path !== "string" || typeof edit.content !== "string") {
      throw new Error("Invalid edit request");
    }
  }
  log.debug(editReq, `Received request to edit:`); //  ${JSON.stringify(editReq)}`);

  const latestCommit = await resolveRef(env.branch);
  const latestTree = await git.readTree({ ...gitOpts, oid: latestCommit });

  log.info(`Editing on top of root tree ${latestTree.oid} at commit ${latestCommit}`);

  let rootTreeOid = latestTree.oid;
  for (const edit of editReq) {

    const filename = edit.path.includes("/") ? edit.path.split("/").pop() : edit.path;
    // Split the path into an array of subdirs (omitting the filename)
    const dirs = edit.path.split("/").reverse().slice(1).reverse();
    if (filename === "" || dirs.includes("")) {
      throw new Error(`Filename or some dir is an empty string for path ${edit.path}`);
    }
    log.debug(`filename: ${filename} | dirs: ${dirs}`);

    const treePath = await git.walk({
      ...gitOpts,
      trees: [git.TREE({ ref: rootTreeOid })],
      map: async (filepath: string) => {
        if (filepath === ".") {
          const obj = await git.readTree({ ...gitOpts, oid: rootTreeOid });
          return { path: "root", oid: obj.oid, val: obj.tree };
        } else if (edit.path.startsWith(filepath)) {
          log.debug(`Found the ${filepath} in ${edit.path}!`);
          const obj = await git.readObject({ ...gitOpts, oid: rootTreeOid, filepath });
          return { path: filepath, oid: obj.oid, val: obj.object };
        }
        return undefined;
      },
    });
    log.debug(`${treePath.map(entry => `${entry.path}:${entry.oid.substring(0, 8)}`).join(", ")}`);

    if (edit.content === "") {
      log.info(`Deleting references to ${edit.path}`);
      let toRemove = filename;
      let newEntry;
      for (const dir of ["root"].concat(dirs).reverse()) {
        const tree = treePath.find(t => t.path.endsWith(dir))?.val || [];
        if (tree.length === 0) {
          log.warn(`No tree found for this path, moving on..`);
          toRemove = dir;
          continue;
        }
        const rmIndex = tree.findIndex(e => e.path === toRemove);
        if (rmIndex >= 0) {
          log.debug(`Removing ${dir}[${rmIndex}]`);
          tree.splice(rmIndex, 1);
          toRemove = undefined;
        }
        if (tree.length > 0) {
          const syncIndex = tree.findIndex(e => newEntry?.path && e.path === newEntry.path);
          if (syncIndex >= 0) {
            log.debug(`Replacing ${dir}[${syncIndex}] with entry ${JSON.stringify(newEntry)}`);
            tree[syncIndex] = newEntry;
            toRemove = undefined;
          }
          newEntry = {
            mode: "040000",
            oid: await git.writeTree({ ...gitOpts, tree }),
            type: "tree",
            path: dir,
          };
          toRemove = undefined;
        } else {
          log.debug(`Nothing left in ${dir}, flagging it for deletion`);
          toRemove = dir;
        }
      }
      rootTreeOid = newEntry.oid;

    } else {
      const newBlobOid = await git.writeBlob({ ...gitOpts, blob: strToArray(edit.content) });
      log.info(`Wrote new blob for ${filename}: ${newBlobOid}`);
      let newEntry = { mode: "100644", oid: newBlobOid, type: "blob", path: filename };
      for (const dir of ["root"].concat(dirs).reverse()) {
        const tree = treePath.find(t => t.path.endsWith(dir))?.val || [];
        log.debug(`${tree.length > 0 ? "Using existing" : "Creating new"} tree for ${dir}`);
        const index = tree.findIndex(e => e.path === newEntry.path);
        if (index >= 0) {
          log.debug(`Replacing ${dir}[${index}] with ${JSON.stringify(newEntry)}`);
          tree[index] = newEntry;
        } else {
          log.debug(`Pushing new entry into ${dir}: ${JSON.stringify(newEntry)}`);
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
    }
  }

  if (rootTreeOid === latestTree.oid) {
    log.info(`No differences detected, doing nothing`);
    return { status: "no change", commit: latestCommit };
  }
  log.info(`Final root tree has oid: ${rootTreeOid}`);

  if (await resolveRef(env.branch) !== latestCommit) {
    throw new Error(`Latest commit on ${env.branch} was updated mid-edit`);
  }

  const committer = {
    name: `${env.authUsername}@${env.domainname}`,
    email: env.email,
    timestamp: Math.round(Date.now()/1000),
    timezoneOffset: 0,
  };
  const newCommit = await git.writeCommit({ ...gitOpts, commit: {
    message: `edit ${editReq.map(e => e.path).join(", ")}`,
    tree: rootTreeOid,
    parent: [latestCommit],
    author: committer,
    committer,
  } });
  await git.writeRef({
    ...gitOpts,
    force: true,
    ref: `refs/heads/${env.branch}`,
    value: newCommit,
  });
  log.info(`Wrote new commit to ${env.branch} w hash: ${newCommit}`);
  await pushToMirror();
  return { status: "success", commit: newCommit };
};
