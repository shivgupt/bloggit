import http from "http";
import * as url from "url";
import zlib from "zlib";

import { getGitBackend } from "./git-backend";
import { streamToString, stringToStream } from "./utils";

const server = http.createServer(async (req, res) => {
  console.log(`\n==========`);
  console.log(`git server received a ${req.method} req for: ${req.url}`);
  const reqStream = req.headers["content-encoding"] === "gzip"
    ? req.pipe(zlib.createGunzip())
    : req;

  const err = (msg): void => {
    console.log(`Error, not launching service: ${msg}`);
    return res.end(msg + "\n");
  };

  let parsedUrl;
  try { parsedUrl = url.parse(decodeURIComponent(req.url)); }
  catch (e) { err(e.message); return; }
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  if (/\.\/|\.\./.test(path)) { err("invalid git path"); return; }
  console.log(`Parsed uri to path=${path} and query=${query}`);

  // give input for info aka just the path & query
  const backend = getGitBackend(path, query, err, res);
  // give input for the actual service call aka pipe in post body
  reqStream.pipe(backend);

  // If we wait for entire reqStream BEFORE piping to the backend, it hangs.. Why tho?
  const reqString = await streamToString(reqStream);
  console.log(`req stream is done producing ${reqString.length} chars of input`);

  // get output
  const response = await streamToString(backend);
  console.log(`backend stream returning: <<${response}>>`);
  stringToStream(response).pipe(res);

});
console.log(`git server is listening on port 5000`);
server.listen(5000);
