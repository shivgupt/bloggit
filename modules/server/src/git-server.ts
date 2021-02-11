import { spawn } from "child_process";
import http from "http";
import * as url from "url";
import zlib from "zlib";

import { env } from "./env";
import { getGitBackend } from "./git-backend";
import { streamToString } from "./utils";

const server = http.createServer(async (req, res) => {
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

  const reqString = await streamToString(reqStream);
  console.log(`Req stream contains: <<${reqString}>>`);

  const cb = (service): void => {
    const contentType = "application/x-" + service.cmd + "-advertisement";
    console.log(`setting content-type header to: ${contentType}`);
    res.setHeader("content-type", contentType);
    const args = service.args.concat(env.contentDir);
    console.log(`Spawning ${service.cmd} ${args.toString().split(",").join(" ")}`);
    const ps = spawn(service.cmd, args);
    ps.on("error", (e) => console.log(`===== Failed to spawn child ${e}`));
    ps.on("close", (code) => console.log(`===== Child spawn exited with code ${code}`));
    ps.stdout.on("data", (data) => console.log(`===== Child produced output: ${data}`));
    ps.stderr.on("data", (data) => console.log(`===== Child produced errors: ${data}`));
    const stream = service.createStream();
    streamToString(stream).then(s => console.log(`----- Created an inner stream: ${s}`));
    ps.stdout.pipe(stream).pipe(ps.stdin);
  };

  const backend = getGitBackend(path, query, err, cb);

  reqStream.pipe(backend).pipe(res);
});
console.log(`git server is listening on port 5000`);
server.listen(5000);
