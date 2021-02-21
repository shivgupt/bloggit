
export type PostData = {
  category: string;
  featured?: string;
  lastEdit: string;
  img?: string;
  path: string;
  slug: string;
  tags: string[];
  title: string;
  tldr: string;
};

export type PostIndex = {
  about: string;
  drafts: { [slug: string]: PostData };
  posts: { [slug: string]: PostData };
  style?: any;
  title: string;
}

export type SidebarNode = {
  parent: string | null,
  current: string,
  child: any,
}
