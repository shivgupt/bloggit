import { BlogIndex, PostData } from "@blog/types";

export type AdminMode = "invalid" | "enabled" | "disabled";

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