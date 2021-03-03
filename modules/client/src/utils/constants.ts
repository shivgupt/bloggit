import { PostData, BlogIndex } from "@blog/types";
import { EditPostValidation } from "../types";

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

export const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

export const timeOptions = { hour12: false, hour: "2-digit", minute: "2-digit" };

export const defaultValidation: EditPostValidation = {
  title: { err: false, msg: "", req: true },
  category: { err: false, msg: "", req: false },
  slug: { err: false, msg: "", req: true },
  tldr: { err: false, msg: "", req: false },
};