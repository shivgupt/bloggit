import { BlogIndex, HistoryResponse, PostData } from "@bloggit/types";
import axios from "axios";

import { emptyIndex } from "./constants";

export const fetchRef = async (): Promise<string> => {
  const configUrl = "/git/config";
  console.log(`Fetching latest ref from ${configUrl}`);
  const response = await axios(configUrl);
  if (!response || !response.data) {
    throw new Error(`Failed to retrieve data from ${configUrl}`);
  }
  if (!response.data.commit) {
    throw new Error(`Failed to retrieve branch from data: ${JSON.stringify(response.data)}`);
  }
  return response.data.commit.substring(0, 8);
};

const fileCache: { [ref: string]: { [path: string]: string; } } = {};
export const fetchFile = async (path: string, _ref?: string): Promise<string> => {
  const ref = _ref || await fetchRef();
  if (!fileCache[ref]) {
    fileCache[ref] = {};
  }
  if (!fileCache[ref][path]) {
    const url = `/git/${ref}/${path}`;
    try {
      console.log(`Fetching file from ${url}`);
      const response = await axios(url);
      if (response && response.data && response.data.content) {
        fileCache[ref][path] = response.data.content;
      } else {
        throw new Error(`Got bad data from ${url}: ${JSON.stringify(response.data)}`);
      }
    } catch (e) {
      console.error(e.message);
      fileCache[ref][path] = "Does Not Exist";
    }
  }
  return fileCache[ref][path];
};

export const fetchIndex = async (_ref?: string): Promise<BlogIndex> => {
  try {
    const ref = _ref || await fetchRef();
    const indexContent = await fetchFile("index.json", ref);
    const index = JSON.parse(indexContent);
    if (!index || !index.posts) {
      throw new Error(`Got invalid site index: ${JSON.stringify(index)}`);
    }
    // Also set slug property based on the keynames
    Object.keys(index.posts).forEach(slug => {
      index.posts[slug].slug = slug;
    });
    return index;
  } catch (e) {
    console.warn(e.message);
    return emptyIndex;
  }
};

const historyCache: { [slug: string]: HistoryResponse } = {};
export const fetchHistory = async (slug: string, force?: boolean): Promise<HistoryResponse> => {
  if (!slug) return [];
  if (!force && historyCache[slug]) {
    return historyCache[slug];
  }
  const url = `/git/history/${slug}`;
  console.log(`Fetching history from ${url}`);
  const response = await axios(url);
  if (!response || !response.data) {
    console.warn(`Failed to retrieve data from ${url}`);
    return [];
  }
  if (!response.data.length) {
    console.warn(`Failed to retrieve valid history entries for ${slug}`, response.data);
    return [];
  }
  historyCache[slug] = response.data as HistoryResponse;
  return historyCache[slug];
};

const slugToPath = async (slug: string, ref: string): Promise<string> => {
  if (!slug || !ref) return "";
  if (historyCache[slug]) {
    const history = historyCache[slug].find(entry => entry.commit?.startsWith(ref));
    if (history?.path) {
      console.log(`Found path for ${ref}/${slug} in history: ${history.path}`);
      return history.path;
    }
  }
  console.log(`Path for ${ref}/${slug} is not available via git history`);
  const index = await fetchIndex(ref);
  const entry = (index?.posts?.[slug] || {}) as PostData;
  let path;
  if (entry.path) {
    path = entry.path;
    try {
      await fetchFile(path, ref);
      return path;
    } catch (e) {
      console.warn(`${path} does not exist on ${ref}: ${e.message}`);
    }
  }
  if (entry.category) {
    path = `${entry.category}/${slug}.md`;
    try {
      await fetchFile(path, ref);
      return path;
    } catch (e) {
      console.warn(`${path} does not exist on ${ref}: ${e.message}`);
    }
  }
  path = `${slug}.md`;
  try {
    await fetchFile(path, ref);
    return path;
  } catch (e) {
    console.warn(`${path} does not exist on ${ref}: ${e.message}`);
  }
  throw new Error(`No valid path exists for ${slug}`);
};

export const fetchContent = async(
  slug: string,
  _ref?: string,
): Promise<string> => {
  const ref = _ref || await fetchRef();
  const path = await slugToPath(slug, ref);
  return await fetchFile(path, ref);
};
