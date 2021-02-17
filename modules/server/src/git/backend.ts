import { spawn } from "child_process";

import { env } from "../env";
import { logger } from "../utils";

import { bufferToStream, pushToMirror, streamToBuffer } from "./utils";

const log = logger.child({ module: "GitRouter" });

const regex = {
  "git-receive-pack": RegExp("([0-9a-fA-F]+) ([0-9a-fA-F]+) (refs/[^ \x00]+)( |00|\x00)|^(0000)$"),
  "git-upload-pack": /^\S+ ([0-9a-fA-F]+)/,
};

const execPackService = async (
  service: "git-upload-pack" | "git-receive-pack",
  payload?: Buffer,
): Promise<Buffer> => new Promise((resolve, reject) => {
  let output = Buffer.from([]);
  const args = [ "--stateless-rpc" ];
  if (!payload) args.push("--advertise-refs");
  args.push(env.contentDir);
  const spawnChild = async (): Promise<void> => {
    log.info(`Spawning: ${service} ${args.toString().split(",").join(" ")}`);
    const ps = spawn(service, args);
    ps.on("error", reject);
    ps.on("close", code => log.debug(`${service} exited with code ${code}`));
    ps.stdout.on("data", out => log.debug(`${service} sent ${out.length} chars to stdout`));
    ps.stderr.on("data", d => log.error(d));
    ps.stdin.on("data", out => log.debug(`${service} received ${out.length} chars from stdin`));
    if (payload) bufferToStream(payload).pipe(ps.stdin);
    return resolve(Buffer.concat([output, await streamToBuffer(ps.stdout)]));
  };
  if (payload) {
    if (!regex[service].exec(payload.slice(0,512).toString("utf8"))) {
      return reject(new Error(`Invalid payload provided to ${service}`));
    }
  } else {
    const flag = "# service=" + service + "\n";
    const n = (4 + flag.length).toString(16);
    const infoData = Array(4 - n.length + 1).join("0") + n + flag + "0000";
    output = Buffer.concat([output, Buffer.from(infoData)]);
    log.debug(`Adding ${output.length} bytes of ref info data to output`);
  }
  spawnChild();
});

const getErrHandler = res => (e: string): void => {
  log.error(`Git pack service failure: ${e}`);
  return res.status(500).send(`Server Error`);
};

export const getRefInfo = async (req, res, _): Promise<void> => {
  const err = getErrHandler(res);
  const service = req?.query?.service?.toString() || "";
  if (service !== "git-upload-pack" && service !== "git-receive-pack") {
    return err(`${service} is an invalid git service`);
  }
  const response = await execPackService(service).catch(err);
  if (response) {
    res.setHeader("content-type", `application/x-${service}-advertisement`);
    log.info(`Sending ${response.length} bytes of ref info`);
    res.send(response);
  }
};

export const pack = async (req, res, _): Promise<void> => {
  const err = getErrHandler(res);
  const service = req.path.split("/").pop();
  if (service !== "git-upload-pack" && service !== "git-receive-pack") {
    return err(`${service} is an invalid git service`);
  }
  const response = await execPackService(service, req.body).catch(err);
  if (response) {
    log.info(`Sending ${response.length} bytes of pack response`);
    res.send(response);
  }
  if (service === "git-receive-pack" && env.mirrorUrl && env.mirrorKey) {
    await pushToMirror();
  }
};
