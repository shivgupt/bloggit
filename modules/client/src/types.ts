export type PostData = {
  category: string;
  content?: string;
  img?: string;
  path: string;
  slug: string;
  tags: string[];
  title: string;
  tldr: string;
};

export type PostIndex = {
  posts: { [slug: string]: PostData };
  style?: any;
  title: string;
}
