import { PostData } from '../types';
import axios from 'axios';

const getUrl = (file: string): string => {
  if (!process || !process.env || typeof process.env.REACT_APP_CONTENT_URL !== 'string') {
    return file;
  }
  return `${process.env.REACT_APP_CONTENT_URL.replace(/\/$/, '')}/${file}`
}

let postsPromiseCache: Promise<PostData[]> | undefined;

export const getPostIndex = async (): Promise<PostData[]> => {
  if (!postsPromiseCache) {
    postsPromiseCache = new Promise(async (resolve, reject) => {
      try {
        const response = (await axios(getUrl('index.json')) as any);
        if (!response || !response.data || !response.data.posts) {
          reject(`Couldn't get post index from ${JSON.stringify(response)}`);
        }
        resolve(response.data.posts);
      } catch (e) {
        reject(e);
      }
    });
  }
  return await postsPromiseCache;
}

export const getPostData = async (slug: string): Promise<PostData | undefined> =>
  (await getPostIndex()).find(post => post.slug === slug);

export const getPostContent = async (slug: string): Promise<string> => {
  const data = await getPostData(slug)
  if (!data) { return ''; }
  const url = getUrl(data.path);
  console.log(`fetching url ${url}`);
  const response = await fetch(url);
  return response.text();
}
