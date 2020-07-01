import { emptyFitnessProfile } from "./constants";

const load = (key: string): any => {
  try {
    let data = localStorage.getItem(key);
    console.log(`Loaded ${JSON.stringify(data)} for key ${key}`);
    if (data) return JSON.parse(data);
    return emptyFitnessProfile;
  } catch (e) {
    return emptyFitnessProfile;
  }
};

const save = (key: string, value?: any): void => {
  console.log(`Saving ${JSON.stringify(value, null, 2)}`);
  localStorage.setItem(key, JSON.stringify(value));
};

export const store = { load, save };
