const emptyStore: any = {
  theme: "light"
};

const load = (key: string): any => {
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

const save = (key: string, value?: any): void => {
  localStorage.setItem(key, JSON.stringify(value || emptyStore[key]));
};

export const store = { load, save };
