import { PostData, PostIndex } from "../types";

export const emptyIndex: PostIndex = {
  posts: {},
  drafts: {},
  about: "",
  title: "My Personal Website",
};

export const emptyPost: PostData = {
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
