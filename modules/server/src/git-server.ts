import http from "http";
import * as url from "url";
import zlib from "zlib";

import { getGitBackend } from "./git-backend";
import { streamToString } from "./utils";

const server = http.createServer((req, res) => {
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

  const backendStream = getGitBackend(path, query, err, res);

  streamToString(backendStream).then(s => console.log(`Backend stream returned: <<${s}>>`));

  reqStream.pipe(backendStream).pipe(res);
});
console.log(`git server is listening on port 5000`);
server.listen(5000);
