import { ipfs } from "./utils";

export const rmPin = async (cid: string): Promise<string> =>
  ipfs.pin.rm(cid, { recursive: true });
