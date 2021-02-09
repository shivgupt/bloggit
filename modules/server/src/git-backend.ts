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
  const self = this;
  const stream = new Duplex();
  const backend = this._backend;

  stream._write = function (buf, enc, next) {
    // dont send terminate signal
    if (buf.length !== 4 && buf.toString() !== "0000") backend.push(buf);
    else stream.needsPktFlush = true;

    if (backend._ready) next();
    else stream._next = next;
  };

  stream._read = function () {
    const next = backend._next;
    const buf = backend._buffer;
    backend._next = null;
    backend._buffer = null;
    if (buf) stream.push(buf);
    if (next) next();
  };

  backend._stream = stream;
  if (backend._ready) stream._read();

  stream.on("finish", function f () {
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
      if (stream.needsPktFlush) backend.push(new Buffer("0000"));
      backend.push(null);
    }
  });

  if (this.info) backend.push(infoPrelude(this.cmd));
  return stream;
};

Service.prototype.createBand = function () {
  const stream = new Writable();
  stream._write = function (buf, enc, next) {
    stream._buffer = buf;
    stream._next = next;
  };
  this._bands.push(stream);
  return stream;
};

function infoPrelude (service) {
  function pack (s) {
    const n = (4 + s.length).toString(16);
    return Array(4 - n.length + 1).join("0") + n + s;
  }
  return pack("# service=" + service + "\n") + "0000";
}

inherits(Backend, Duplex);

export function Backend (uri, cb) {
  if (!(this instanceof Backend)) return new Backend(uri, cb);
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

  if (this.service !== "git-upload-pack" || this.service !== "git-receive-pack") {
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
  if (this._stream && this._stream.next) {
    this._ready = false;
    this._stream.next();
  }
  else this._ready = n;
};

Backend.prototype._write = function (buf, enc, next) {
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

  const [_, s] = buf.slice(0,512).toString("utf8");
  const m = regex[this.service].exec(s);
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
