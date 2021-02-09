import { Duplex } from "stream";
import * as url from "url";
import { inherits } from "util";
import qs from "querystring";

const regex = {
  "git-receive-pack": RegExp(
    "([0-9a-fA-F]+) ([0-9a-fA-F]+) (refs/[^ \x00]+)( |00|\x00)|^(0000)$",
  ),
  "git-upload-pack": /^\S+ ([0-9a-fA-F]+)/
};

const fields = {
  "git-receive-pack": [ "last", "head", "refname" ],
  "git-upload-pack": [ "head" ]
};

type ServiceOpts = {
  cmd: string,
  info?: boolean,
  last?: string,
  head?: string,
  refname?: string,
  tag?: string,
};

type IService = {
  createStream: any;
  type: string;
  args: string[];
  cmd: string;
}

export const getService = (opts: ServiceOpts, backend: any): IService => {
  console.log(`Service(${JSON.stringify(opts)}, ${typeof backend})`);
  const self = {} as any;
  self.info = opts.info;
  self.cmd = opts.cmd;
  self.action = self.info ? "info" : {
    "git-receive-pack": (opts.tag ? "tag" : "push"),
    "git-upload-pack": "pull"
  }[self.cmd];
  self.type = "application/x-" + self.cmd + "-advertisement";
  self._backend = backend;
  self.fields = {};
  if (opts.head) self.fields.head = opts.head;
  if (opts.last) self.fields.last = opts.last;
  if (opts.refname) {
    self.fields.refname = opts.refname;
    const refInfo = /^refs\/(heads|tags)\/(.*)$/.exec(opts.refname);
    if (refInfo) {
      self.fields.ref = refInfo[1];
      self.fields.name = refInfo[2];
      if (self.action === "tag") self.fields.tag = self.fields.name;
      else if (self.action === "push") self.fields.branch = self.fields.name;
    }
  }
  self.args = [ "--stateless-rpc" ];
  if (self.info) self.args.push("--advertise-refs");
  return {
    type: self.type,
    args: self.args,
    cmd: self.cmd,
    createStream: () => {
      console.log(
        `Service.prototype.createStream w self._backend._ready=${self._backend._ready}`,
      );
      const stream = new Duplex();
      const backend = self._backend;
      stream._read = () => {
        console.log(`stream._read()`);
        const next = backend._next;
        const buf = backend._buffer;
        backend._next = null;
        backend._buffer = null;
        console.log(`buf=${typeof buf}`);
        console.log(`next=${typeof next}`);
        if (buf) stream.push(buf);
        if (next) next();
      };
      stream._write = (buf, enc, next) => {
        console.log(`stream._write() w backend._ready = ${backend._ready}`);
        // dont send terminate signal
        if (buf.length !== 4 && buf.toString() !== "0000") backend.push(buf);
        else (stream as any).needsPktFlush = true;
        if (backend._ready) next();
        else (stream as any)._next = next;
      };
      backend._stream = stream;
      if (backend._ready) {
        console.log(`GitBackend is ready, _reading stream`);
        stream._read(undefined as any);
      }
      stream.on("finish", () => {
        if ((stream as any).needsPktFlush) backend.push(new Buffer("0000"));
        backend.push(null);
      });
      if (self.info) {
        console.log(`infoPrelude(${self.cmd})`);
        const pack = (s: string): string => {
          const n = (4 + s.length).toString(16);
          return Array(4 - n.length + 1).join("0") + n + s;
        };
        backend.push(pack("# service=" + self.cmd + "\n") + "0000");
      }
      return stream;
    },
  };
};

inherits(GitBackend, Duplex);

export function GitBackend (uri, cb: (err: string, service: IService) => void) {
  const error = (msg) => process.nextTick((): void => {
    self.emit("error", typeof msg === "string" ? new Error(msg) : msg);
  });
  console.log(`GitBackend(${uri}, ${typeof cb})`);
  if (!(this instanceof GitBackend)) return new (GitBackend as any)(uri, cb);
  const self = this;
  Duplex.call(self);
  if (cb) {
    self.on("service", (s) => { cb(null, s); });
    self.on("error", cb);
  }
  try { uri = decodeURIComponent(uri); }
  catch (err) { return error(err.message); }
  const u = url.parse(uri);
  if (/\.\/|\.\./.test(u.pathname)) return error("invalid git path");
  console.log(`Parsed uri to pathname=${u.pathname} and query=${u.query}`);
  self.parsed = false;
  const parts = u.pathname.split("/");
  if (/\/info\/refs$/.test(u.pathname)) {
    const params = qs.parse(u.query);
    self.service = params.service;
    self.info = true;
  }
  else {
    self.service = parts[parts.length-1];
  }
  console.log(`Set service to ${self.service} (info=${self.info})`);
  if (self.service !== "git-upload-pack" && self.service !== "git-receive-pack") {
    return error("unsupported git service");
  }
  if (self.info) {
    const service = getService({ cmd: self.service, info: true }, self);
    process.nextTick(() => self.emit("service", service));
  }
}

GitBackend.prototype._read = function (n) {
  console.log(`GitBackend.prototype._read`);
  if (this._stream && this._stream.next) {
    this._ready = false;
    this._stream.next();
  }
  else this._ready = n;
};

GitBackend.prototype._write = function (buf, enc, next) {
  console.log(`GitBackend.prototype._write`);
  if (this._stream) {
    this._next = next;
    this._stream.push(buf);
    return;
  }
  else if (this.info) {
    this._buffer = buf;
    this._next = next;
    return;
  }
  if (this._prev) buf = Buffer.concat([ this._prev, buf ]);
  const res = buf.slice(0,512).toString("utf8");
  console.log(`Sliced buffer of length ${buf.length} into ${res}`);
  const m = regex[this.service].exec(res);
  console.log(`Got a regex match: ${m}`);
  if (m) {
    this._prev = null;
    this._buffer = buf;
    this._next = next;
    const keys = fields[this.service];
    const row = { cmd: this.service };
    for (let i = 0; i < keys.length; i++) {
      row[keys[i]] = m[i+1];
    }
    this.emit("service", getService(row, this));
  }
  else if (buf.length >= 512) {
    return this.emit("error", new Error("unrecognized input"));
  }
  else {
    this._prev = buf;
    next();
  }
};
