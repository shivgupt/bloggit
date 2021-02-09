import http from "http";
import { spawn } from "child_process";
import zlib from "zlib";

import { env } from "./env";
import { Backend as gitBackend } from "./git-backend";

const server = http.createServer(function (req, res) {
  console.log(`git server received a ${req.method} req for: ${req.url}`);
  const reqStream = req.headers["content-encoding"] === "gzip"
    ? req.pipe(zlib.createGunzip())
    : req;
  reqStream.pipe(
    gitBackend(req.url, function (err, service) {
      console.log(`Error, not launching service: ${err}`);
      if (err) return res.end(err + "\n");
      console.log(`Launching service ${service.action}`);
      res.setHeader("content-type", service.type);
      const ps = spawn(service.cmd, service.args.concat(env.contentDir));
      ps.on("error", (e) => console.log(`===== Failed to spawn child ${e}`));
      ps.on("close", (code) => console.log(`===== Child spawn exited with code ${code}`));
      ps.stdout.on("data", (data) => console.log(`===== Child produced output: ${data}`));
      ps.stderr.on("data", (data) => console.log(`===== Child produced errors: ${data}`));
      ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
    }),
  ).pipe(res);
});
console.log(`git server is listening on port 5000`);
server.listen(5000);
