import path from "path";

export type Env = {
  adminToken: string;
  contentDir: string;
  defaultBranch: string;
  logLevel: string;
  port: number;
  prodMode: boolean;
}

export const env: Env = {
  adminToken: process?.env?.BLOG_ADMIN_TOKEN || "abc123",
  contentDir: path.normalize(process?.env?.BLOG_INTERNAL_CONTENT_DIR || "/blog-content.git"),
  defaultBranch: process?.env?.BLOG_DEFAULT_BRANCH || "main",
  logLevel: process?.env?.BLOG_LOG_LEVEL || "info",
  port: parseInt(process?.env?.BLOG_PORT || "8080", 10),
  prodMode: process?.env?.BLOG_PROD === "true",
};
