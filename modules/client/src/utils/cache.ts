import { emptyFitnessProfile } from "./constants";

const emptryStore: any = {
  FitnessProfile: emptyFitnessProfile,
  contentUrlIndex: 0,
};

const load = (key: string): any => {
  try {
    let data = localStorage.getItem(key);
    // console.log(`Loaded ${JSON.stringify(data)} for key ${key}`);
    if (data) return JSON.parse(data);
    return emptryStore[key];
  } catch (e) {
    return emptryStore[key];
  }
};

const save = (key: string, value?: any): void => {
  // console.log(`Saving ${JSON.stringify(value, null, 2)} for key ${key}`);
  localStorage.setItem(key, JSON.stringify(value || emptryStore[key]));
};

export const store = { load, save };
