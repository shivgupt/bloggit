import { PostData } from './types';
//import * as posts from './postsContent';
import axios from 'axios';

let posts: PostData[] | undefined;

export const getPostIndex = async (): Promise<PostData[]> => {
  if (!posts) {
    const response = (await axios(`${process.env.REACT_APP_CONTENT_URL}index.json`) as any);
    posts = response.data.posts;
  }
  return posts;
}

export const getPostData = async (slug: string): Promise<PostData> => {
  const posts = await getPostIndex();

  for(let post of posts) {
    if (post.slug === slug) {
      return post
    }
  }
  return {} as PostData;
}


