import { spawn } from "child_process";
import { Duplex } from "stream";
import qs from "querystring";

import { env } from "./env";
import { streamToString } from "./utils";

type BufferEncoding = string;
type Bufferish = string | Buffer;

type ServiceOpts = {
  cmd: string,
  head?: string,
  info?: boolean,
  last?: string,
  refname?: string,
  tag?: string,
};

type IStream = Duplex & {
  _next: (err?: Error) => void;
  _read: () => void;
  needsPktFlush: boolean;
  next: (err?: Error) => void;
}

type IBackend = Duplex & {
  _buffer: null | Bufferish;
  _next: (err?: Error) => void;
  _prev: null | Bufferish;
  _read: () => void;
  _ready: boolean | number;
  _stream: IStream;
  _write: (buf: Bufferish, enc: BufferEncoding, next: (err?: Error) => void) => void;
}

type IService = {
  args: string[];
  cmd: string;
  createStream: () => Duplex;
  type: string;
}

export const getService = (opts: ServiceOpts, backend: IBackend): IService => {
  console.log(`Service(${JSON.stringify(opts)}, ${typeof backend})`);
  const type = "application/x-" + opts.cmd + "-advertisement";
  const args = [ "--stateless-rpc" ];
  if (opts.info) args.push("--advertise-refs");
  const createStream = (): IStream => {
    console.log(`Service.createStream()`);
    const stream = new Duplex() as IStream;
    stream._read = (): void => {
      const next = backend._next;
      const buf = backend._buffer;
      backend._next = null;
      backend._buffer = null;
      if (buf) stream.push(buf);
      if (next) next();
    };
    stream._write = (
      buf: string | Buffer,
      enc: BufferEncoding,
      next: (err?: Error) => void,
    ): void => {
      // dont send terminate signal
      if (buf.length !== 4 && buf.toString() !== "0000") backend.push(buf);
      else stream.needsPktFlush = true;
      if (backend._ready) next();
      else stream._next = next;
    };
    backend._stream = stream;
    if (backend._ready) {
      stream._read();
    }
    stream.on("finish", (): void => {
      if (stream.needsPktFlush) backend.push(Buffer.from("0000"));
      backend.push(null);
    });
    if (opts.info) {
      const flag = "# service=" + opts.cmd + "\n";
      const n = (4 + flag.length).toString(16);
      backend.push(Array(4 - n.length + 1).join("0") + n + flag + "0000");
    }
    return stream;
  };
  return { type, args, cmd: opts.cmd, createStream } as IService;
};

export const getGitBackend = (
  path: string,
  query: string,
  err: (e?: string | Error) => void,
  res: any,
): IBackend => {
  console.log(`GitBackend(${path}, ${query})`);
  const backend = new Duplex() as IBackend;

  backend.on("error", err);
  backend.on("service", (service: IService): void => {
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
  });

  ////////////////////////////////////////

  let info = false;
  let service: string;
  if (/\/info\/refs$/.test(path)) {
    info = true;
    service = qs.parse(query).service.toString();
  } else {
    const parts = path.split("/");
    service = parts[parts.length-1];
    if (service !== "git-upload-pack" && service !== "git-receive-pack") {
      err("unsupported git service");
      return backend;
    }
  }

  if (info) {
    process.nextTick((): void => {
      backend.emit("service", getService({ cmd: service, info: true }, backend));
    });
  }

  backend._read = (n?: number): void => {
    console.log(`GitBackend._read`);
    if (backend._stream && backend._stream.next) {
      backend._ready = false;
      backend._stream.next();
    } else {
      backend._ready = n;
    }
  };

  backend._write = (buf, enc, next): void => {
    console.log(`GitBackend._write`);
    if (backend._stream) {
      backend._next = next;
      backend._stream.push(buf);
      return;
    } else if (info) {
      backend._buffer = buf;
      backend._next = next;
      return;
    }
    if (backend._prev) {
      buf = Buffer.concat([ backend._prev, buf ]);
    }
    const m = {
      "git-receive-pack": RegExp(
        "([0-9a-fA-F]+) ([0-9a-fA-F]+) (refs/[^ \x00]+)( |00|\x00)|^(0000)$",
      ),
      "git-upload-pack": /^\S+ ([0-9a-fA-F]+)/
    }[service].exec(buf.slice(0,512).toString("utf8"));
    if (m) {
      backend._prev = null;
      backend._buffer = buf;
      backend._next = next;
      const keys = {
        "git-receive-pack": [ "last", "head", "refname" ],
        "git-upload-pack": [ "head" ]
      }[service];
      const row = { cmd: service };
      for (let i = 0; i < keys.length; i++) {
        row[keys[i]] = m[i+1];
      }
      backend.emit("service", getService(row, backend));
    } else if (buf.length >= 512) {
      backend.emit("error", new Error("unrecognized input"));
      return;
    } else {
      backend._prev = buf;
      next();
    }
  };

  return backend;
};
