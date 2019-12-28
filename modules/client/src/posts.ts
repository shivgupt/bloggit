import { PostData } from './types';
//import * as posts from './postsContent';
import axios from 'axios';

export const getPostIndex = async (): Promise<PostData[]> => {
  const url = `${process.env.REACT_APP_CONTENT_URL}index.json`
  console.log(`fetching index from ${url}`)
  const index = await fetch(url)
  console.log(index)
  return Array<{}> as PostData[]
}

export const getPostData = async (slug: string): Promise<PostData> => {
  /*
  for(let post of Object.keys(posts)) {
    if ((posts as any)[post].slug === slug) {
      return (posts as any)[post]
    }
  }
   */
  return {} as PostData;
}


