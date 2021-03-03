import { ipfs } from "./utils";

export const rmPin = async (cid: string): Promise<boolean> => {
  const unpinnedCid = await ipfs.pin.rm(cid, { recursive: true });
  return !!unpinnedCid;
};
