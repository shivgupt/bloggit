import { Duplex } from "stream";
import * as url from "url";
import qs from "querystring";

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
    console.log(`Service.createStream w backend._ready=${backend._ready}`);
    const stream = new Duplex() as IStream;
    stream._read = (): void => {
      console.log(`stream._read()`);
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
      console.log(`stream._write() w backend._ready = ${backend._ready}`);
      // dont send terminate signal
      if (buf.length !== 4 && buf.toString() !== "0000") backend.push(buf);
      else stream.needsPktFlush = true;
      if (backend._ready) next();
      else stream._next = next;
    };
    backend._stream = stream;
    if (backend._ready) {
      console.log(`GitBackend is ready, _reading stream`);
      stream._read();
    }
    stream.on("finish", (): void => {
      if (stream.needsPktFlush) backend.push(new Buffer("0000"));
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
  uri: string,
  cb: (err: string, service: IService) => void,
): IBackend => {
  console.log(`GitBackend(${uri}, ${typeof cb})`);
  const backend = new Duplex() as IBackend;
  const err = (msg): void => {
    process.nextTick((): void => {
      backend.emit("error", typeof msg === "string" ? new Error(msg) : msg);
    });
  };
  if (!uri) { err(`WTF where's the uri bro?`); return backend; }
  if (!cb) { err(`WTF where's the callback bro?`); return backend; }

  backend.on("service", (s): void => { cb(null, s); });
  backend.on("error", cb);

  ////////////////////////////////////////
  /// Parse URL

  let parsedUrl;
  try { parsedUrl = url.parse(decodeURIComponent(uri)); }
  catch (err) { err(err.message); return backend; }
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  if (/\.\/|\.\./.test(path)) { err("invalid git path"); return backend; }
  console.log(`Parsed uri to path=${path} and query=${query}`);

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
  console.log(`Set service to ${service} (info=${info})`);

  if (info) {
    process.nextTick((): void => {
      backend.emit("service", getService({ cmd: service, info: true }, backend));
    });
  }

  backend._read = (n?: number): void => {
    console.log(`GitBackend.prototype._read`);
    if (backend._stream && backend._stream.next) {
      backend._ready = false;
      backend._stream.next();
    } else {
      backend._ready = n;
    }
  };

  backend._write = (buf, enc, next): void => {
    console.log(`GitBackend.prototype._write`);
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
    const regex = {
      "git-receive-pack": RegExp(
        "([0-9a-fA-F]+) ([0-9a-fA-F]+) (refs/[^ \x00]+)( |00|\x00)|^(0000)$",
      ),
      "git-upload-pack": /^\S+ ([0-9a-fA-F]+)/
    };
    const m = regex[service].exec(buf.slice(0,512).toString("utf8"));
    console.log(`Got regex match: ${JSON.stringify(m)}`);
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
