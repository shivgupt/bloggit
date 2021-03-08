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

export type SidebarNode = {
  parent: string,
  current: string,
  child?: any,
}

export type SnackAlert = {
  open: boolean,
  msg: string,
  severity: "error" | "warning" | "info" | "success",
  action?: any,
  hideDuration?: number,
}
