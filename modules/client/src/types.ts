import { BlogIndex, PostData } from "@bloggit/types";

export type AdminMode = "invalid" | "enabled" | "disabled";

export type PostsByCategory = {
  [category: string]: PostData[];
};

export type GitState = {
  currentContent: string;
  indexEntry: PostData; // always synced w latestContent
  currentRef: string;
  index: BlogIndex; // always latest
  latestRef: string;
  slug: string; // according to current url
};

type CategoryNode = { current: "categories"; };
type PostNode = { parent: "categories"; current: "posts"; value: string; };
type TocNode = { parent: "posts"; current: "toc"; value: PostData; };
export type SidebarNode = CategoryNode | PostNode | TocNode;

export type SnackAlert = {
  open: boolean,
  msg: string,
  severity: "error" | "warning" | "info" | "success",
  action?: any,
  hideDuration?: number,
}
