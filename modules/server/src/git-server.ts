import http from "http";
import * as url from "url";
import zlib from "zlib";
import qs from "querystring";

import { getGitBackend } from "./git-backend";
import {
  bufferToStream,
  logger,
  streamToBuffer,
  streamToString,
  stringToStream,
  wait,
} from "./utils";

const log = logger.child({ module: "GitServer" });

const server = http.createServer(async (req, res) => {
  log.info(`==========`);
  log.info(`git server received a ${req.method} req for: ${req.url}`);
  const reqStream = req.headers["content-encoding"] === "gzip"
    ? req.pipe(zlib.createGunzip())
    : req;

  const err = (msg): void => {
    log.info(`Error, not launching service: ${msg}`);
    return res.end(msg + "\n");
  };

  let parsedUrl;
  try { parsedUrl = url.parse(decodeURIComponent(req.url)); }
  catch (e) { err(e.message); return; }
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  if (/\.\/|\.\./.test(path)) { err("invalid git path"); return; }
  log.debug(`Parsed uri to path=${path} and query=${query}`);

  if (query) {
    const cmd = qs.parse(query).service.toString();
    const contentType = "application/x-" + cmd + "-advertisement";
    log.info(`setting content-type header to ${contentType}`);
    res.setHeader("content-type", contentType);
  }

  // give input for info aka just the path & query
  const backend = getGitBackend(path, query, err);
  await wait(1000);

  // If we wait for entire reqStream BEFORE piping to the backend, it hangs.. Q: Why tho?
  // A: the stream can only be read once, if we read it into a string then we can't read it later
  const reqBuffer = await streamToBuffer(reqStream);
  log.info(`req stream is done producing ${reqBuffer.toString("utf8").length} chars of input`);

  // give input for the actual service call aka pipe in post body
  bufferToStream(reqBuffer).pipe(backend);

  // get output
  const response = await streamToString(backend);
  log.info(`backend stream returning: <<${response}>>`);
  stringToStream(response).pipe(res);

});
log.info(`git server is listening on port 5000`);
server.listen(5000);
