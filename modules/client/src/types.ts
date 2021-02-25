
export type PostData = {
  title: string;
  slug: string;
  createdOn: string;
  category?: string;
  featured?: string;
  img?: string;
  lastEdit?: string;
  path?: string;
  tags?: string[];
  tldr?: string;
};

export type PostIndex = {
  about: string;
  drafts: { [slug: string]: PostData };
  posts: { [slug: string]: PostData };
  style?: any;
  title: string;
};

export type PostHistory = Array<{
  commit: string;
  timestamp: string;
}>;

export type SidebarNode = {
  parent: string | null,
  current: string,
  child: any,
}
