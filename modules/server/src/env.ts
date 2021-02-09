import { trimSlash } from "./utils";

export const env = {
  contentBranch: trimSlash(process.env.BLOG_CONTENT_BRANCH || "master"),
  contentDir: trimSlash(process.env.BLOG_CONTENT_DIR || ""),
  contentRepo: trimSlash(process.env.BLOG_CONTENT_REPO || ""),
  devMode: process.env.NODE_ENV === "development",
  port: parseInt(process.env.PORT, 10) || 8080,
};

