import { PostData, BlogIndex } from "@bloggit/types";

import {
  GitState,
  SnackAlert,
  SidebarNode,
} from "../types";

export const emptySidebarNode: SidebarNode = {
  current: "categories",
};

export const emptyIndex: BlogIndex = {
  posts: {},
  title: "",
};

export const emptyEntry: PostData = {
  publishedOn: "",
  category: "",
  lastEdit: "",
  slug: "",
  path: "",
  tldr: "",
  title: "",
};

export const initialGitState: GitState = {
  currentContent: "Loading..",
  currentRef: "",
  index: emptyIndex,
  indexEntry: emptyEntry,
  latestRef: "",
  slug: "",
};

export const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

export const timeOptions = { hour12: false, hour: "2-digit", minute: "2-digit" };

export const defaultSnackAlert: SnackAlert = {
  open: false,
  msg: "",
  severity: "info",
};
