import axios from "axios";
import { PostIndex, ServerConfig } from "../types";

let indexCache: Promise<PostIndex> | undefined;
let contentCache: { [key: string]: Promise<string>; } = {};


// Remember which contentUrl worked & try that one first from now on
const smartIndexKey = "contentUrlIndex";
const smartIndex = (i: number) => {
  const contentUrlIndex = localStorage.getItem(smartIndexKey) || "0";
  return (i + parseInt(contentUrlIndex, 10)) % 2;
};

const get = async (file: string): Promise<string | PostIndex> => {
  const config = (await axios("/api/config")).data as ServerConfig;
  const path = `${config.contentBranch}/${config.contentDir}${file}`;
  const urls = [`${config.contentUrl}/${path}`, `/api/${path}`];
  for (let i = 0; i < urls.length; i += 1) {
    const url = urls[smartIndex(i)];
    try {
      const response = await axios(url);
      if (response && response.data) {
        if (i !== 0) {
          console.log(`Setting default content url to ${i}: ${url.replace(path, "")}`);
          localStorage.setItem(smartIndexKey, smartIndex(i).toString());
        }
        return response.data;
      }
      console.warn(`Got bad data from ${url}: ${JSON.stringify(response.data)}`);
    } catch (e) {
      console.warn(e.message);
    }
  }
  throw new Error(`Couldn't get ${path}`);
};

export const fetchIndex = async(): Promise<PostIndex> => {
  if (!indexCache) {
    indexCache = get("index.json") as Promise<PostIndex>;
  }
  const index = await indexCache;
  if (!index || !index.posts) {
    throw new Error(`Got invalid site index ${typeof index}: ${index}`);
  }
  // Set some default values
  Object.keys(index!.posts).forEach(slug => {
    const post = index.posts[slug];
    index.posts[slug].category = post.path.substring(0, post.path.indexOf("/")) || "default";
    index.posts[slug].content = post.content || "";
    index.posts[slug].slug = slug;
  });
  return index;
};

export const fetchContent = async(slug: string): Promise<string> => {
  if (!contentCache[slug]) {
    const post = (await fetchIndex()).posts[slug];
    // TODO: Handle 404s better
    if (!post) { return "Loading"; }
    contentCache[slug] = get(post.path) as Promise<string>;
  }
  return contentCache[slug];
};
