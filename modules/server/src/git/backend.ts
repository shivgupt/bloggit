import { logger } from "../utils";

import { getGitBackend } from "./bin";

const log = logger.child({ module: "GitRouter" });

export const getRefInfo = async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.warn(`Git backend failure: ${e}`);
    res.status(500).send(e);
    return;
  };
  const cmd = req?.query?.service?.toString() || "";
  const response = await getGitBackend(req.path, cmd, req.body, err);
  log.info(`Successfully got ${response.length} bytes of ref info`);
  if (cmd) {
    const contentType = "application/x-" + cmd + "-advertisement";
    log.info(`setting content-type header to ${contentType}`);
    res.setHeader("content-type", contentType);
  }
  res.send(response);
};

export const pack = async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.warn(`Git backend failure: ${e}`);
    res.status(500).send(e);
    return;
  };
  log.info(`Activating git backend for ${req.body?.length} bytes posted to ${req.path}`);
  const cmd = req?.query?.service?.toString() || "";
  const response = await getGitBackend(req.path, cmd, req.body, err);
  log.info(`Successfully got ${response.length} bytes of pack response`);
  res.send(response);
};
