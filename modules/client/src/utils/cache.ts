import {
  getProfileStoreObjFromState,
  getProfileStateFromStoreObj,
} from "./helper";

const emptyStore: any = {
  theme: "light"
};

const load = (key: string): any => {
  try {
    let data = localStorage.getItem(key);
    if (data) {
      // console.log(`Loaded ${(data)} for key ${key}`);
      if (key === "FitnessProfile") {
        return getProfileStateFromStoreObj(data);
      }
      return JSON.parse(data);
    }
    return emptyStore[key];
  } catch (e) {
    return emptyStore[key];
  }
};

const save = (key: string, value?: any): void => {
  if (value) {
    if (key === "FitnessProfile") {
      value = getProfileStoreObjFromState(value);
    }
  }
  localStorage.setItem(key, JSON.stringify(value || emptyStore[key]));
};

export const store = { load, save };
