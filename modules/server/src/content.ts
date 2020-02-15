import express from "express";
import path from "path";
import fetch from "node-fetch";

import { env } from "./env";

export const content = express.Router();

content.use(async (req, res, next): Promise<void> => {
  if (!env.contentUrl || env.devMode) {
    next();
    return;
  }
  const url = `${env.contentUrl}/${req.path.replace(/^\/content\//, "").replace(/\/+/, "/")}`;
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
content.use(async (req, res, next): Promise<void> => {
  const folder = path.normalize("/blog-content");
  console.log(`Attempting to get static file ${folder}${req.path}`);
  express.static(folder, {
    extensions: ["json", "md"],
  } )(req, res, next);
});
