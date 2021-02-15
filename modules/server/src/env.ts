import path from "path";

export type Env = {
  authUsername: string;
  authPassword: string;
  contentDir: string;
  defaultBranch: string;
  logLevel: string;
  port: number;
  prodMode: boolean;
}

export const env: Env = {
  authUsername: process?.env?.BLOG_AUTH_USERNAME || "admin",
  authPassword: process?.env?.BLOG_AUTH_PASSWORD || "abc123",
  contentDir: path.normalize(process?.env?.BLOG_INTERNAL_CONTENT_DIR || "/blog-content.git"),
  defaultBranch: process?.env?.BLOG_DEFAULT_BRANCH || "main",
  logLevel: process?.env?.BLOG_LOG_LEVEL || "info",
  port: parseInt(process?.env?.BLOG_PORT || "8080", 10),
  prodMode: process?.env?.BLOG_PROD === "true",
};
