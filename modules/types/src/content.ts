export type PostData = {
  slug: string;
  title: string;
  category?: string;
  draft?: boolean;
  featured?: boolean;
  img?: string;
  lastEdit?: string;
  path?: string;
  publishedOn?: string;
  tldr?: string;
};
export type Posts = {
  [slug: string]: PostData;
};

export type BlogIndex = {
  posts: Posts;
  title: string;
};
