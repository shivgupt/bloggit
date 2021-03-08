type Store = {
  theme: string;
  authToken?: string;
}

const emptyStore: Store = {
  theme: "light"
};

const load = (key: string): string => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return emptyStore[key];
  } catch (e) {
    return emptyStore[key];
  }
};

const save = (key: string, value?: string): void => {
  localStorage.setItem(key, JSON.stringify(value || emptyStore[key]));
};

export const store = { load, save };
