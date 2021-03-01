export type AdminMode = "invalid" | "enabled" | "disabled";

export type GitState = {
  currentContent: string;
  currentRef: string;
  index: PostIndex;
  indexEntry: PostData;
  latestRef: string;
  slug: string;
};

export type PostData = {
  title: string;
  slug: string;
  publishedOn: string;
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
  parent: string,
  current: string,
  child: any,
}
