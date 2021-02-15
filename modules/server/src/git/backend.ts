import { logger } from "../utils";

import { getGitBackend } from "./bin";

const log = logger.child({ module: "GitRouter" });

export const getRefInfo = async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.warn(`Git backend failure: ${e}`);
    res.status(500).send(e);
    return;
  };
  const service = req?.query?.service?.toString() || "";
  if (service !== "git-upload-pack" && service !== "git-receive-pack") {
    err(`Invalid git service: ${service}`);
    return;
  }
  let response;
  try {
    response = await getGitBackend(service, true, req.body);
  } catch (e) {
    err(e.message);
    return;
  }
  log.info(`Successfully got ${response.length} bytes of ref info`);
  const contentType = "application/x-" + service + "-advertisement";
  log.info(`setting content-type header to ${contentType}`);
  res.setHeader("content-type", contentType);
  res.send(response);
};

export const pack = async (req, res, _): Promise<void> => {
  const err = (e: string): void => {
    log.warn(`Git backend failure: ${e}`);
    res.status(500).send(e);
    return;
  };
  const service = req.path.split("/").pop();
  if (service !== "git-upload-pack" && service !== "git-receive-pack") {
    err(`Invalid git service: ${service}`);
    return;
  }
  log.info(`Activating git backend for ${req.body?.length} bytes posted to ${req.path}`);

  let response;
  try {
    response = await getGitBackend(service, false, req.body);
  } catch (e) {
    err(e.message);
    return;
  }

  log.info(`Successfully got ${response.length} bytes of pack response`);
  res.send(response);
};
