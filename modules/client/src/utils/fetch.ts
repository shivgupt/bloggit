import axios from "axios";

import { PostIndex } from "../types";

let indexCache: Promise<PostIndex> | undefined;
const contentCache: { [key: string]: Promise<string>; } = {};

const get = async (file: string): Promise<string | PostIndex> => {
  const url = `/git/main/${file}`;
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

export const fetchIndex = async(): Promise<PostIndex> => {
  if (!indexCache) {
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

export const fetchContent = async(slug: string): Promise<string> => {
  if (!contentCache[slug]) {
    const post = (await fetchIndex()).posts[slug];
    // TODO: Handle 404s better
    if (!post) { return "Loading"; }
    contentCache[slug] = get(post.path) as Promise<string>;
  }
  return contentCache[slug];
};
