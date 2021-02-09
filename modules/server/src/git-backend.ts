import { Duplex, Writable } from "stream";
import * as url from "url";
import { inherits } from "util";
import qs from "querystring";

import { encode } from "git-side-band-message";

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

function Service (opts, backend) {
  console.log(`Service(${JSON.stringify(opts)}, ${typeof backend})`);
  this.info = opts.info;
  this.cmd = opts.cmd;
  this._bands = [];

  this.action = this.info ? "info" : {
    "git-receive-pack": (opts.tag ? "tag" : "push"),
    "git-upload-pack": "pull"
  }[this.cmd];

  this.type = "application/x-" + this.cmd + "-advertisement";
  this._backend = backend;

  this.fields = {};

  if (opts.head) this.fields.head = opts.head;
  if (opts.last) this.fields.last = opts.last;

  if (opts.refname) {
    this.fields.refname = opts.refname;

    const refInfo = /^refs\/(heads|tags)\/(.*)$/.exec(opts.refname);

    if (refInfo) {
      this.fields.ref = refInfo[1];
      this.fields.name = refInfo[2];

      if (this.action === "tag") this.fields.tag = this.fields.name;
      else if (this.action === "push") this.fields.branch = this.fields.name;
    }
  }


  this.args = [ "--stateless-rpc" ];
  if (this.info) this.args.push("--advertise-refs");
}

Service.prototype.createStream = function () {
  console.log(`Service.prototype.createStream w this._backend._ready=${this._backend._ready}`);
  const self = this;
  const stream = new Duplex();
  const backend = this._backend;

  stream._write = function (buf, enc, next) {
    console.log(`stream._write() w backend._ready = ${backend._ready}`);
    // dont send terminate signal
    if (buf.length !== 4 && buf.toString() !== "0000") backend.push(buf);
    else (stream as any).needsPktFlush = true;

    if (backend._ready) next();
    else (stream as any)._next = next;
  };

  stream._read = function () {
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

  backend._stream = stream;
  // TODO how many bytes should we actually read?
  if (backend._ready) {
    console.log(`Backend is ready, _reading stream`);
    stream._read(undefined as any);
  }

  stream.on("finish", function f () {
    console.log(`stream.on(finish) w _bands.length=${self._bands.length}`);
    if (self._bands.length) {
      const s = self._bands.shift();
      s._write = function (buf, enc, next) {
        backend.push(encode(buf));
        next();
      };
      s.on("finish", f);
      const buf = s._buffer;
      const next = s._next;
      s._buffer = null;
      s._next = null;
      if (buf) backend.push(encode(buf));
      if (next) next();
    }
    else {
      if ((stream as any).needsPktFlush) backend.push(new Buffer("0000"));
      backend.push(null);
    }
  });

  if (this.info) backend.push(infoPrelude(this.cmd));
  return stream;
};

Service.prototype.createBand = function () {
  console.log(`Service.prototype.createBand`);
  const stream = new Writable();
  stream._write = function (buf, enc, next) {
    (stream as any)._buffer = buf;
    (stream as any)._next = next;
  };
  this._bands.push(stream);
  return stream;
};

function infoPrelude (service) {
  console.log(`infoPrelude(${service})`);
  function pack (s) {
    const n = (4 + s.length).toString(16);
    return Array(4 - n.length + 1).join("0") + n + s;
  }
  return pack("# service=" + service + "\n") + "0000";
}

inherits(Backend, Duplex);

export function Backend (uri, cb) {
  console.log(`Backend(${uri}, ${typeof cb})`);
  if (!(this instanceof Backend)) return new (Backend as any)(uri, cb);
  const self = this;
  Duplex.call(this);

  if (cb) {
    this.on("service", function (s) { cb(null, s); });
    this.on("error", cb);
  }

  try { uri = decodeURIComponent(uri); }
  catch (err) { return error(err.message); }

  const u = url.parse(uri);
  if (/\.\/|\.\./.test(u.pathname)) return error("invalid git path");
  console.log(`Parsed uri to pathname=${u.pathname} and query=${u.query}`);

  this.parsed = false;
  const parts = u.pathname.split("/");

  if (/\/info\/refs$/.test(u.pathname)) {
    const params = qs.parse(u.query);
    this.service = params.service;
    this.info = true;
  }
  else {
    this.service = parts[parts.length-1];
  }
  console.log(`Set service to ${this.service} (info=${this.info})`);

  if (this.service !== "git-upload-pack" && this.service !== "git-receive-pack") {
    return error("unsupported git service");
  }

  if (this.info) {
    const service = new Service({ cmd: this.service, info: true }, self);
    process.nextTick(function () {
      self.emit("service", service);
    });
  }

  function error (msg) {
    const err = typeof msg === "string" ? new Error(msg) : msg;
    process.nextTick(function () { self.emit("error", err); });
  }
}

Backend.prototype._read = function (n) {
  console.log(`Backend.prototype._read`);
  if (this._stream && this._stream.next) {
    this._ready = false;
    this._stream.next();
  }
  else this._ready = n;
};

Backend.prototype._write = function (buf, enc, next) {
  console.log(`Backend.prototype._write`);
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
    this.emit("service", new Service(row, this));
  }
  else if (buf.length >= 512) {
    return this.emit("error", new Error("unrecognized input"));
  }
  else {
    this._prev = buf;
    next();
  }
};
