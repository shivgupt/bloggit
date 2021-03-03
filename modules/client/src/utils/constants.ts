import { PostData, BlogIndex } from "@blog/types";
import { EditPostValidation } from "../types";

import { EditData, GitState } from "../types";

export const emptyIndex: BlogIndex = {
  posts: {},
  drafts: {},
  title: "My Personal Website",
};

export const emptyEntry: PostData = {
  publishedOn: "",
  category: "",
  lastEdit: "",
  slug: "",
  path: "",
  tags: [],
  tldr: "",
  title: "",
};

export const emptyEdit = {
  ...(emptyEntry as any),
  slug: null,
} as EditData;

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

export const defaultValidation: EditPostValidation = {
  title: { err: false, msg: "" },
  category: { err: false, msg: "" },
  slug: { err: false, msg: "" },
  tldr: { err: false, msg: "" },
};
