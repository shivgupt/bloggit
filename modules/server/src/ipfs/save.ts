import { ipfs } from "./utils";

export const save = async (payload: any): Promise<string> => {
  const result = await ipfs.add(payload, { pin: true });
  return `/ipfs/${result.path}`;
};
