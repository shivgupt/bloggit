import { spawn } from "child_process";
import { Readable } from "stream";

import { env } from "../env";
import { logger } from "../utils";

const log = logger.child({ module: "GitPack" });

const regex = {
  "git-receive-pack": RegExp("([0-9a-fA-F]+) ([0-9a-fA-F]+) (refs/[^ \x00]+)( |00|\x00)|^(0000)$"),
  "git-upload-pack": /^\S+ ([0-9a-fA-F]+)/,
};

const bufferToStream = (buf: Buffer): Readable => Readable.from(buf);
const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

export const execPackService = async (
  service: string,
  payload?: Buffer,
): Promise<Buffer> => new Promise((resolve, reject) => {
  let output = Buffer.from([]);
  if (service !== "git-upload-pack" && service !== "git-receive-pack") {
    throw new Error(`${service} is an invalid git service`);
  }
  const args = [ "--stateless-rpc" ];
  if (!payload) args.push("--advertise-refs");
  args.push(env.contentDir);
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
  log.info(`Spawning: ${service} ${args.toString().split(",").join(" ")}`);
  const ps = spawn(service, args);
  ps.on("error", reject);
  ps.on("close", code => log.debug(`${service} exited with code ${code}`));
  ps.stdout.on("data", out => log.debug(`${service} sent ${out.length} chars to stdout`));
  ps.stderr.on("data", d => log.error(d));
  ps.stdin.on("data", out => log.debug(`${service} received ${out.length} chars from stdin`));
  if (payload) bufferToStream(payload).pipe(ps.stdin);
  streamToBuffer(ps.stdout).then(stdout => resolve(Buffer.concat([output, stdout])));
});
