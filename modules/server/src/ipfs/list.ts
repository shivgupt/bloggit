import { ipfs } from "./utils";

export const lsPins = async (): Promise<Array<string>> => {
  const pins = [];
  for await (const { cid } of ipfs.pin.ls()) {
    pins.push(cid);
  }
  return pins;
};
