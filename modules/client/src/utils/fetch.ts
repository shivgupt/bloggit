import axios from "axios";

import { PostIndex } from "../types";

let indexCache: Promise<PostIndex> | undefined;
const contentCache: { [key: string]: Promise<string>; } = {};
let configCache: Promise<any> | undefined;

const get = async (file: string): Promise<string | PostIndex> => {
  if (!configCache) {
    configCache = axios("/git/config")
  }
  const config = (await configCache).data;
  const url = `/git/${config.branch}/${file}`;
  try {
    const response = await axios(url);
    if (response && response.data && response.data.content) {
      return response.data.content;
    }
    console.warn(`Got bad data from ${url}: ${JSON.stringify(response.data)}`);
  } catch (e) {
    console.warn(e.message);
  }
  throw new Error(`Couldn't get ${file}`);
};

export const fetchIndex = async(force?: boolean): Promise<PostIndex> => {
  if (!indexCache || force) {
    indexCache = get("index.json") as Promise<PostIndex>;
  }
  const index = JSON.parse((await indexCache) as any);
  if (!index || !index.posts) {
    throw new Error(`Got invalid site index ${typeof index}: ${index}`);
  }
  // Set some default values
  Object.keys(index!.posts).forEach(slug => {
    const post = index.posts[slug];
    index.posts[slug].content = post.content || "";
    index.posts[slug].slug = slug;
  });
  return index;
};

export const fetchFile = async (path: string): Promise<string> => get(path) as Promise<string>;

export const fetchContent = async(slug: string, force?: boolean): Promise<string> => {
  if (!contentCache[slug] || force) {
    const index = await fetchIndex();
    if (index.posts[slug]) {
      contentCache[slug] = get(index.posts[slug].path) as Promise<string>;
    } else if (index.drafts[slug]) {
      contentCache[slug] = get(index.drafts[slug].path) as Promise<string>;
    } else {
      return "Page does not exist"
    }
  }
  return contentCache[slug];
};
