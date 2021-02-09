import http from "http";
import { spawn } from "child_process";
import path from "path";
import zlib from "zlib";

import { Backend as gitBackend } from "./git-backend";

const server = http.createServer(function (req, res) {
  const repo = req.url.split("/")[1];
  const dir = path.join(__dirname, "repos", repo);
  const reqStream = req.headers["content-encoding"] === "gzip"
    ? req.pipe(zlib.createGunzip())
    : req;
  reqStream.pipe(gitBackend(req.url, function (err, service) {
    if (err) return res.end(err + "\n");
    res.setHeader("content-type", service.type);
    console.log(service.action, repo, service.fields);
    const ps = spawn(service.cmd, service.args.concat(dir));
    ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
  })).pipe(res);
});
server.listen(5000);
