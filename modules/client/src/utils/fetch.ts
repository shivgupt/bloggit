import axios from "axios";

import { PostData, PostIndex } from "../types";

let branchCache: string;
export const fetchBranch = async (force?: boolean): Promise<string> => {
  if (!branchCache || force) {
    const configPath = "/git/config";
    console.log(`F${force ? "orcefully f" : ""}etching branch from ${configPath}`);
    const response = await axios(configPath);
    if (!response || !response.data) {
      throw new Error(`Failed to retrieve data from ${configPath}`);
    }
    if (!response.data.branch) {
      throw new Error(`Failed to retrieve branch from data: ${JSON.stringify(response.data)}`);
    }
    branchCache = response.data.branch;
  }
  return branchCache;
}

let fileCache: { [ref: string]: { [path: string]: string; } } = {};
export const fetchFile = async (path: string, _ref?: string, force?: boolean): Promise<string> => {
  const ref = _ref || await fetchBranch();
  if (!fileCache[ref]) {
    fileCache[ref] = {};
  }
  if (!fileCache[ref][path] || force) {
    const url = `/git/${ref}/${path}`;
    try {
      console.log(`F${force ? "orcefully f" : ""}etching file from ${url}`);
      const response = await axios(url);
      if (response && response.data && response.data.content) {
        fileCache[ref][path] = response.data.content;
      } else {
        throw new Error(`Got bad data from ${url}: ${JSON.stringify(response.data)}`);
      }
    } catch (e) {
      console.error(e.message);
      throw new Error(`Couldn't get ${path}: ${e.message}`);
    }
  }
  return fileCache[ref][path];
};

export const fetchIndex = async(_ref?: string, force?: boolean): Promise<PostIndex> => {
  const ref = _ref || await fetchBranch();
  const indexContent = await fetchFile("index.json", ref, force);
  const index = JSON.parse(indexContent);
  if (!index || !index.posts) {
    throw new Error(`Got invalid site index: ${JSON.stringify(index)}`);
  }
  // Also set slug property based on the keynames
  Object.keys(index.posts).forEach(slug => {
    index.posts[slug].slug = slug;
  });
  return index;
};

export const fetchContent = async(
  slug: string,
  _ref?: string,
  force?: boolean,
): Promise<string> => {
  const ref = _ref || await fetchBranch();
  const index = await fetchIndex(ref, force);
  const entry = (index.posts && index.posts[slug]) ? index.posts[slug]
    : (index.drafts && index.drafts[slug]) ? index.drafts[slug]
    : {} as PostData;
  if (!entry.path && slug === "about") {
    entry.path = entry.path || index.about;
  }
  if (entry.path) {
    try {
      return await fetchFile(entry.path, ref, force);
    } catch (e) {
      console.error(`${entry.path} does not exist: ${e.message}`)
    }
  }
  return await fetchFile(`${entry.category}/${slug}.md`, ref, force);
};
