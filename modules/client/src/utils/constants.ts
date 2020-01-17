import { PostIndex, PostData } from "../types";

export const emptyIndex: PostIndex = {
  posts: [],
  title: "My Personal Website",
};

export const emptyPost: PostData = {
  category: "",
  slug: "",
  path: "",
  tags: [],
  tldr: "",
  title: "",
};
