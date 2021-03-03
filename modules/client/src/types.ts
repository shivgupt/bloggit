import { BlogIndex, PostData } from "@blog/types";

export type AdminMode = "invalid" | "enabled" | "disabled";

export type EditData = PostData & {
  slug: string | null;
}

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
  child: any,
}

export type EditPostValidation = {
  [entry: string]: {
    err: boolean,
    msg: string,
  }
}

export type SnackAlert = {
  open: boolean,
  msg: string,
  severity: "error" | "warning" | "info" | "success",
  action?: any,
  hideDuration?: number,
}
