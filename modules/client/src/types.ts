export type PostData = {
  slug: string;
  path: string;
  tags: string[];
  tldr: string;
  title: string;
};

export type PostIndex = {
  posts: PostData[];
  style: any;
  title: string;
}
