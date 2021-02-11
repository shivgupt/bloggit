import http from "http";
import * as url from "url";
import zlib from "zlib";
import qs from "querystring";

import { getGitBackend } from "./git-backend";
import {
  bufferToStream,
  logger,
  streamToBuffer,
  //streamToString,
  //stringToStream,
  // wait,
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

  // The stream can only be read once, if we read it into a var then we can't read it again later
  const reqBuffer = await streamToBuffer(reqStream);
  log.info(`req stream is done producing ${reqBuffer.length} bytes of input`);

  // provide input to git backend & wait for output
  const response = await getGitBackend(path, query, reqBuffer, err);

  // get output
  log.info(`backend stream returning: <<${response.toString("utf8")}>>`);
  bufferToStream(response).pipe(res);

});
log.info(`git server is listening on port 5000`);
server.listen(5000);
