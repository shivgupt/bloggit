import http from "http";
import { spawn } from "child_process";
import zlib from "zlib";

import { env } from "./env";
import { getGitBackend } from "./git-backend";

const server = http.createServer(function (req, res) {
  console.log(`git server received a ${req.method} req for: ${req.url}`);
  const reqStream = req.headers["content-encoding"] === "gzip"
    ? req.pipe(zlib.createGunzip())
    : req;
  reqStream.pipe(

    getGitBackend(req.url, function (err, service) {
      if (err) {
        console.log(`Error, not launching service: ${err}`);
        return res.end(err + "\n");
      }

      res.setHeader("content-type", service.type);

      const args = service.args.concat(env.contentDir);
      console.log(`Spawning ${service.cmd} ${args.toString().split(",").join(" ")}`);
      const ps = spawn(service.cmd, args);
      ps.on("error", (e) => console.log(`===== Failed to spawn child ${e}`));
      ps.on("close", (code) => console.log(`===== Child spawn exited with code ${code}`));
      ps.stdout.on("data", (data) => console.log(`===== Child produced output: ${data}`));
      ps.stderr.on("data", (data) => console.log(`===== Child produced errors: ${data}`));

      ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
    }) as any,

  ).pipe(res);
});
console.log(`git server is listening on port 5000`);
server.listen(5000);
