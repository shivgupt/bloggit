import { trimSlash } from "./utils";

export type Env = {
  contentDir: string;
  defaultBranch: string;
  port: number;
  prodMode: boolean;
}

export const env: Env = {
  contentDir: trimSlash(process.env.BLOG_INTERNAL_CONTENT_DIR || ""),
  defaultBranch: trimSlash(process.env.BLOG_DEFAULT_BRANCH || "main"),
  port: parseInt(process?.env?.BLOG_PORT || "8080", 10),
  prodMode: process?.env?.BLOG_PROD === "true",
};
