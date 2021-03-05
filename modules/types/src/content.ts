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

export type BlogIndex = {
  posts: { [slug: string]: PostData };
  title: string;
};
