import { spawn } from "child_process";
import { Duplex } from "stream";

import { env } from "../env";
import { logger } from "../utils";

import { bufferToStream, streamToBuffer } from "./utils";

const log = logger.child({ module: "GitBackend" });

// const keys = {"git-receive-pack": [ "last", "head", "refname" ], "git-upload-pack": [ "head" ]};

type BufferEncoding = string;

export const getGitBackend = (
  path: string,
  service: string,
  payload: Buffer,
  err: (e?: string | Error) => void,
): Promise<Buffer> => {
  log.info(`GitBackend(${path}, ${service})`);
  const backend = new Duplex();

  backend.on("error", err);

  let info = false;
  let cmd: string;
  const args = [ "--stateless-rpc" ];
  if (/\/info\/refs$/.test(path)) {
    info = true;
    cmd = service;
    args.push("--advertise-refs");
  } else {
    const parts = path.split("/");
    cmd = parts[parts.length-1];
    if (cmd !== "git-upload-pack" && cmd !== "git-receive-pack") {
      err("unsupported git service");
      return Promise.resolve(Buffer.from([]));
    }
  }
  args.push(env.contentDir);

  ////////////////////////////////////////

  let psBuffer: Buffer;
  let psCallback: (err?: Error) => void;
  let psStream: Duplex;
  let inputReady: number;

  const spawnChild = (): void => {
    psStream = new Duplex();
    let needsPktFlush: boolean;
    psStream._read = (): void => {
      log.info(`reading ${psBuffer ? psBuffer.toString("utf8").length : 0} chars from service`);
      if (psBuffer) psStream.push(psBuffer);
      if (psCallback) psCallback();
      psCallback = null;
      psBuffer = null;
    };
    psStream._write = (
      buf: string | Buffer,
      enc: BufferEncoding,
      next: (err?: Error) => void,
    ): void => {
      log.info(`writing ${buf ? buf.toString("utf8").length : 0} chars to service`);
      if (buf.length !== 4 && buf.toString() !== "0000") { // dont send terminate signal
        backend.push(buf);
      } else {
        needsPktFlush = true;
      }
      if (inputReady) {
        next();
      }
    };
    if (inputReady) {
      psStream._read(undefined as any);
    }
    psStream.on("finish", (): void => {
      if (needsPktFlush) backend.push(Buffer.from("0000"));
      backend.push(null);
    });
    if (info) {
      const flag = "# service=" + cmd + "\n";
      const n = (4 + flag.length).toString(16);
      backend.push(Array(4 - n.length + 1).join("0") + n + flag + "0000");
    }
    const ps = spawn(cmd, args);
    log.info(`Spawned: ${cmd} ${args.toString().split(",").join(" ")}`);
    ps.on("error", (e) => log.info(`${cmd} failed to launch: ${e}`));
    ps.on("close", (code) => log.info(`${cmd} exited with code ${code}`));
    ps.stdout.on("data", out => log.info(`${cmd} sent ${out.length} chars to stdout`));
    ps.stderr.on("data", err => log.info(`${cmd} sent ${err.length} chars to stderr`));
    ps.stdin.on("data", out => log.info(`${cmd} got ${out.length} chars in stdin`));
    ps.stdout.pipe(psStream).pipe(ps.stdin);
  };

  if (info) {
    spawnChild();
  }

  backend._read = (n?: number): void => {
    log.info(`reading ${n} chars from backend`);
    inputReady = n;
  };

  backend._write = (buf, enc, next): void => {
    log.info(`writing ${buf ? buf.toString("utf8").length : 0} chars to backend`);
    if (psStream) {
      log.debug(`Pushing backend data to psStream`);
      psCallback = next;
      psStream.push(buf);
      return;
    } else if (info) {
      log.debug(`Setting psBuffer to the given buf`);
      psBuffer = buf;
      psCallback = next;
      return;
    }
    const m = {
      "git-receive-pack": RegExp(
        "([0-9a-fA-F]+) ([0-9a-fA-F]+) (refs/[^ \x00]+)( |00|\x00)|^(0000)$",
      ),
      "git-upload-pack": /^\S+ ([0-9a-fA-F]+)/
    }[cmd].exec(buf.slice(0,512).toString("utf8"));
    if (m) {
      log.debug(`Got regex match on ${cmd}'s buffer, spawning child`);
      psBuffer = buf;
      psCallback = next;
      spawnChild();
    } else {
      backend.emit("error", new Error("unrecognized input"));
      return;
    }
  };

  if (payload && payload.length > 0) {
    bufferToStream(payload).pipe(backend);
  }

  return streamToBuffer(backend);
};
