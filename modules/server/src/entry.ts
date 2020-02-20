import express from "express";
import fetch from "node-fetch";
import path from "path";

const trimSlash = (pathPart: string) => pathPart.replace(/^\/+/, "").replace(/\/+$/, "");

export const env = {
  branch: trimSlash(process.env.BLOG_CONTENT_BRANCH || "master"),
  contentDir: trimSlash(process.env.BLOG_CONTENT_DIR || ""),
  contentURL: trimSlash(
    process.env.BLOG_CONTENT_URL || "https://gitlab.com/bohendo/blog-content/raw",
  ),
  devMode: process.env.NODE_ENV === "development",
  port: parseInt(process.env.PORT, 10) || 8080,
};

console.log(`Starting server in env: ${JSON.stringify(env, null, 2)}`);

const app = express();

// First: Log everything
app.use((req, res, next) => { console.log(`=> ${req.path}`); next(); });

// Second: return config if requested
app.use("/config", (req, res, next): void => {
  res.json({
    branch: env.branch,
    contentUrl: env.contentUrl,
    dir: env.contentDir,
  });
});

app.use(async (req, res, next): Promise<void> => {
  // We don't care about stale data in dev-mode, just want it to load as fast as possible
  if (env.devMode) { return next(); }
  // req.path must include the commit
  const url = `${env.contentUrl}/${trimSlash(req.path)}`;
  let result;
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      console.log(`Forwarding content from ${url}`);
      url.endsWith(".json")
        ? res.json(await response.json())
        : res.send(await response.text());
      return;
    }
    result = `${response.status}: ${response.statusText}`;
  } catch (e) {
    result = e.message;
  }
  console.log(`Couldn't fetch content from ${url}: ${result}`);
});

// Third: try to get file from default branch of static copy of content
app.use(`/${env.contentBranch}/`, async (req, res, next): Promise<void> => {
  const folder = path.normalize("/blog-content");
  console.log(`Attempting to get static file ${folder}${req.path}`);
  express.static(folder, { extensions: ["json", "md"] })(req, res, next);
});

// Last: 404
app.use((req, res) => {
  console.log("404: Hello World!!");
  res.status(404).send("Hello World!!");
});

app.listen(env.port, () => console.log(`Listening on port ${env.port}!`));

