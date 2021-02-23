import axios from "axios";

import { PostData, PostIndex, PostHistory } from "../types";

type GitConfig = { branch: string; commit: string; };

let configCache: GitConfig;
export const fetchConfig = async (force?: boolean): Promise<GitConfig> => {
  if (!configCache || force) {
    const configPath = "/git/config";
    console.log(`F${force ? "orcefully f" : ""}etching branch from ${configPath}`);
    const response = await axios(configPath);
    if (!response || !response.data) {
      throw new Error(`Failed to retrieve data from ${configPath}`);
    }
    if (!response.data.branch || !response.data.commit) {
      throw new Error(`Failed to retrieve branch from data: ${JSON.stringify(response.data)}`);
    }
    configCache = response.data;
  }
  return configCache;
}

// TODO: never force, always resovle branch refs to a commit hash
// TODO: instead of throwing, save null to cache so we never re-fetch invalid paths
let fileCache: { [ref: string]: { [path: string]: string; } } = {};
export const fetchFile = async (path: string, _ref?: string, force?: boolean): Promise<string> => {
  const ref = _ref || (await fetchConfig(force)).commit.substring(0, 8);
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

export const fetchIndex = async (_ref?: string, force?: boolean): Promise<PostIndex> => {
  const ref = _ref || (await fetchConfig(force)).commit.substring(0, 8);
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

const slugToPath = async (slug: string, ref: string): Promise<string> => {
  if (!slug) return "";
  const index = await fetchIndex(ref);
  const entry = (index.posts && index.posts[slug]) ? index.posts[slug]
    : (index.drafts && index.drafts[slug]) ? index.drafts[slug]
    : {} as PostData;
  let path;
  if (entry.path) {
    path = entry.path;
    try {
      await fetchFile(path, ref);
      return path;
    } catch (e) {
      console.warn(`${path} does not exist on ${ref}: ${e.message}`)
    }
  }
  if (entry.category) {
    path = `${entry.category}/${slug}.md`;
    try {
      await fetchFile(path, ref);
      return path;
    } catch (e) {
      console.warn(`${path} does not exist on ${ref}: ${e.message}`)
    }
  }
  path = `${slug}.md`;
  try {
    await fetchFile(path, ref);
    return path;
  } catch (e) {
    console.warn(`${path} does not exist on ${ref}: ${e.message}`)
  }
  throw new Error(`No valid path exists for ${slug}`);
};

export const fetchContent = async(
  slug: string,
  _ref?: string,
  force?: boolean,
): Promise<string> => {
  const ref = _ref || (await fetchConfig()).commit.substring(0, 8);
  const path = await slugToPath(slug, ref);
  return await fetchFile(path, ref, force)
};

export const fetchHistory = async (slug: string, _ref?: string): Promise<PostHistory> => {
  if (!slug) return [];
  const ref = _ref || (await fetchConfig()).commit.substring(0, 8);
  const path = await slugToPath(slug, ref);
  const url = `/git/history/${path}?startRef=${ref}`;
  console.log(`Fetching file history from ${url}`);
  const response = await axios(url);
  if (!response || !response.data) {
    throw new Error(`Failed to retrieve data from ${url}`);
  }
  if (!response.data.length) {
    throw new Error(`Failed to retrieve any history entries for ${path}`);
  }
  return response.data as PostHistory;
};
