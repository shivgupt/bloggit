import axios from 'axios';
import { PostIndex, PostData } from '../types';
import { env } from './env'

let indexCache: Promise<PostIndex> | undefined;
let contentCache: { [key: string]: Promise<string>; } = {};

const contentUrls = (file: string): string[] => [
  (!env || typeof env.contentUrl !== 'string') ? file : `${env.contentUrl}/${file}`,
  `/api/content/${file}`,
]

// Remember which contentUrl worked & try that one first from now on
const smartIndexKey = 'contentUrlIndex';
const smartIndex = (i: number) => {
  const contentUrlIndex = localStorage.getItem(smartIndexKey) || "0";
  return (i + parseInt(contentUrlIndex, 10)) % contentUrls('').length
}

const get = async (file: string): Promise<string | PostIndex> => {
  const urls = contentUrls(file);
  for (let i = 0; i < urls.length; i += 1) {
    const url = urls[smartIndex(i)]
    try {
      const response = await axios(url)
      if (response && response.data) {
        if (i !== 0) {
          console.log(`Setting default content url to ${i}: ${url.replace(file, '')}`);
          localStorage.setItem(smartIndexKey, smartIndex(i).toString());
        }
        return response.data;
      }
      console.warn(`Got bad data from ${url}: ${JSON.stringify(response.data)}`);
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

  const posts = (await indexCache).posts;

  return posts.map((post)=> {
    post.category = post.category ||
      post.path.substring(0, post.path.indexOf('/')) ||
      "default";

    return post;
  })
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
