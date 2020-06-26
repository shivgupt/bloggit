import { emptyFitnessProfile } from "./constants";

const load = (key: string): any => {
  try {
    let data = localStorage.getItem(key);
    if (data) return JSON.parse(data)
    return emptyFitnessProfile;
  } catch (e) {
    return emptyFitnessProfile;
  }
}

const save = (key: string, value?: any): void => {
  localStorage.setItem(key, JSON.stringify(value || emptyFitnessProfile));
}

export const store = { load, save };
