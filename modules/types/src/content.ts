export type PostData = {
  category?: string;
  featured?: string;
  img?: string;
  lastEdit?: string;
  path?: string;
  publishedOn: string;
  slug: string;
  tags?: string[];
  title: string;
  tldr?: string;
};

export type BlogIndex = {
  drafts: { [slug: string]: PostData };
  posts: { [slug: string]: PostData };
  title: string;
};
