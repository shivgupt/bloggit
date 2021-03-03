import { ipfs } from "./utils";

export const lsPins = async (): Promise<Array<string>> => {
  const pins = [];
  for await (const { cid, type } of ipfs.pin.ls()) {
    // re pin types: https://docs.ipfs.io/how-to/pin-files/#three-kinds-of-pins
    if (type !== "indirect") {
      pins.push(`/ipfs/${cid.toString()}`);
    }
  }
  pins.sort((a, b) => a.localeCompare(b));
  return pins;
};
