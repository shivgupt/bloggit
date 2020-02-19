import express from "express";
import fetch from "node-fetch";
import path from "path";

export const env = {
  contentUrl: process.env.BLOG_CONTENT_URL,
  devMode: process.env.NODE_ENV === "development",
  port: parseInt(process.env.PORT, 10) || 8080,
};

console.log(`Starting server in env: ${JSON.stringify(env, null, 2)}`);

const app = express();
app.use((req, res, next) => { console.log(`=> ${req.path}`); next(); });

app.use(async (req, res, next): Promise<void> => {
  // We don't care about stale data in dev-mode, just want it to load as fast as possible
  if (!env.contentUrl || env.devMode) {
    next();
    return;
  }
  const url = `${env.contentUrl.replace(/\/+$/, "")}/${req.path.replace(/^\/+/, "")}`;
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

// Fallback to static copy of content (maybe out-of-date)
app.use(async (req, res, next): Promise<void> => {
  const folder = path.normalize("/blog-content");
  console.log(`Attempting to get static file ${folder}${req.path}`);
  express.static(folder, {
    extensions: ["json", "md"],
  } )(req, res, next);
});

app.use((req, res) => {
  console.log("404: Hello World!!");
  res.status(404).send("Hello World!!");
});

app.listen(env.port, () => console.log(`Listening on port ${env.port}!`));

