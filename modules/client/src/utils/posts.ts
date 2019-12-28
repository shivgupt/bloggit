import axios from 'axios';
import { PostIndex, PostData } from '../types';
import { env } from './env'

let indexCache: Promise<PostIndex> | undefined;
let contentCache: { [key: string]: Promise<string>; } = {};

const get = async (file: string): Promise<string | PostIndex> => {
  console.log(`Getting content file ${file}`);
  for (const contentUrl of [
    (!env || typeof env.contentUrl !== 'string') ? file : `${env.contentUrl}/${file}`,
    `/api/content/${file}`,
  ]) {
    try {
      const response = await axios(contentUrl)
      if (response && response.data) {
        return response.data;
      }
      console.warn(`Got bad data from ${contentUrl}: ${JSON.stringify(response.data)}`);
    } catch (e) {
      console.warn(e.message);
    }
  }
  throw new Error(`Couldn't get ${file}`);
}

export const getPostIndex = async (): Promise<PostData[]> => {
  if (!indexCache) {
    indexCache = get('index.json') as Promise<PostIndex>;
  }
  return (await indexCache).posts;
}

export const getPostData = async (slug: string): Promise<PostData | undefined> =>
  (await getPostIndex()).find(post => post.slug === slug);

export const getPostContent = async (slug: string): Promise<string> => {
  if (!contentCache[slug]) {
    const data = await getPostData(slug)
    if (!data) { return ''; }
    contentCache[slug] = get(data.path) as Promise<string>;
  }
  return contentCache[slug];
}



