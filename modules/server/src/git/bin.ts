import { spawn } from "child_process";
import { Duplex } from "stream";

import { env } from "../env";
import { logger } from "../utils";

const log = logger.child({ module: "GitBackend" });

// const keys = {"git-receive-pack": [ "last", "head", "refname" ], "git-upload-pack": [ "head" ]};
const regex = {
  "git-receive-pack": RegExp("([0-9a-fA-F]+) ([0-9a-fA-F]+) (refs/[^ \x00]+)( |00|\x00)|^(0000)$"),
  "git-upload-pack": /^\S+ ([0-9a-fA-F]+)/,
};

export const getGitBackend = async (
  service: "git-upload-pack" | "git-receive-pack",
  info: boolean,
  payload: Buffer,
): Promise<Buffer> => {
  log.info(`GitBackend(${service}, ${info}, payload.length=${payload ? payload.length : 0})`);

  return new Promise((resolve, reject) => {

    let output = Buffer.from([]);

    const args = [ "--stateless-rpc" ];
    if (info) {
      args.push("--advertise-refs");
    }
    args.push(env.contentDir);

    ////////////////////////////////////////

    let childStream: Duplex;
    let inputReady: number;

    const spawnChild = (inputBuf?: Buffer): void => {
      log.info(`Creating child stream`);
      let needsPktFlush: boolean;
      let childBuffer = inputBuf;

      childStream = new Duplex();
      childStream._read = (n?: number): void => {
        log.info(`reading ${n || 0} chars from child`);
        if (childBuffer) {
          log.debug(`pushing childBuffer to childStream`);
          childStream.push(childBuffer);
          childBuffer = null;
        }
      };
      childStream._write = (
        buf: string | Buffer,
        enc: string,
        next: (err?: Error) => void,
      ): void => {
        log.info(`writing ${buf ? buf.toString("utf8").length : 0} chars to child`);
        if (buf.toString() === "0000") { // dont send terminate signal until childStream is finished
          needsPktFlush = true;
        } else {
          log.debug(`Pushing ${buf ? buf.toString("utf8").length : 0} chars to output`);
          output = Buffer.concat([output, Buffer.from(buf)]);
        }
        if (inputReady) {
          log.debug(`Input is ready, activating child._write callback`);
          next(null);
        }
      };
      childStream.on("finish", (): void => {
        log.debug(`childStream is finished, writing terminate signal to output`);
        if (needsPktFlush) {
          output = Buffer.concat([output, Buffer.from("0000")]);
        }
        log.debug(`Resolving promise directly`);
        resolve(output);
      });

      if (info) {
        const flag = "# service=" + service + "\n";
        const n = (4 + flag.length).toString(16);
        const toPush = Array(4 - n.length + 1).join("0") + n + flag + "0000";
        log.debug(`Pushing ${toPush.length} chars of info data to output`);
        output = Buffer.concat([output, Buffer.from(toPush)]);
      }

      log.info(`Spawning: ${service} ${args.toString().split(",").join(" ")}`);
      const ps = spawn(service, args);
      ps.on("error", (e) => log.error(`${service} failed to launch: ${e}`));
      ps.on("close", (code) => log.debug(`${service} exited with code ${code}`));
      ps.stdout.on("data", out => log.debug(`${service} sent ${out.length} chars to stdout`));
      ps.stderr.on("data", err => log.error(`${service} sent ${err.length} chars to stderr`));
      ps.stdin.on("data", out => log.debug(`${service} got ${out.length} chars in stdin`));
      ps.stdout.pipe(childStream).pipe(ps.stdin);
    };

    if (info) {
      inputReady = 16384;
      spawnChild();
    } else if (payload && payload.length > 0) {
      if (regex[service].exec(payload.slice(0,512).toString("utf8"))) {
        log.debug(`Got regex match on ${service}'s input buffer, spawning child`);
        inputReady = 16384;
        spawnChild(payload);
      } else {
        reject(new Error("unrecognized input"));
        return;
      }
    }
  });
};
