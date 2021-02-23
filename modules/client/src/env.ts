
// Env vars only apply during the build step, process.env is not available in the browser at runtime
type BuildEnv = {
  fontFamily: string;
  dark: {
    primary: string;
    secondary: string;
  };
  light: {
    primary: string;
    secondary: string;
  };
};

export const env = {
  fontFamily: process.env.REACT_APP_FONT_FAMILY || "",
  dark: {
    primary: process.env.REACT_APP_DARK_PRIMARY || "#2e2e2e",
    secondary: process.env.REACT_APP_DARK_SECONDARY || "#737373",
  },
  light: {
    primary: process.env.REACT_APP_LIGHT_PRIMARY || "#909090",
    secondary: process.env.REACT_APP_LIGHT_SECONDARY || "#9b9b9b",
  },
} as BuildEnv;
