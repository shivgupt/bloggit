import {
  getProfileStoreObjFromState,
  getProfileStateFromStoreObj,
} from "./helper";
import { emptyFitnessProfile } from "./constants";

const emptryStore: any = {
  FitnessProfile: emptyFitnessProfile,
  contentUrlIndex: 0,
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
    return emptryStore[key];
  } catch (e) {
    return emptryStore[key];
  }
};

const save = (key: string, value?: any): void => {
  if (value) {
    if (key === "FitnessProfile") {
      value = getProfileStoreObjFromState(value);
    }
  }
  localStorage.setItem(key, JSON.stringify(value || emptryStore[key]));
};

export const store = { load, save };
