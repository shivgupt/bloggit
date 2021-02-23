import { createMuiTheme } from "@material-ui/core";
import "@fontsource/monsieur-la-doulaise";

import { env } from "./env";

export const siteTitleFont = createMuiTheme({
  typography: {
    fontFamily: [
      env.fontFamily,
    ].join(","),
  },
});

export const darkTheme = createMuiTheme({
  palette: {
    primary: {
      main: env.dark.primary,
    },
    secondary: {
      main: env.dark.secondary,
    },
    type: "dark",
  },
});

export const lightTheme = createMuiTheme({
  palette: {
    primary: {
      main: env.light.primary,
    },
    secondary: {
      main: env.light.primary,
    },
    type: "light",
  },
});
