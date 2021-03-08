import { BlogIndex, PostData } from "@blog/types";

export type AdminMode = "invalid" | "enabled" | "disabled";

export type PostsByCategory = {
  [category: string]: PostData[];
};

export type GitState = {
  currentContent: string;
  currentRef: string;
  index: BlogIndex;
  indexEntry: PostData;
  latestRef: string;
  slug: string;
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
