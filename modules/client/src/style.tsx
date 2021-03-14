import { createMuiTheme, Theme } from "@material-ui/core/styles";
import "@fontsource/monsieur-la-doulaise";

import { env } from "./env";

export const getFabStyle = (theme: Theme): any => ({
  position: "fixed",
  bottom: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    right: "23%",
  },
  [theme.breakpoints.down("sm")]: {
    right: theme.spacing(2),
  },
});

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
      main: env.light.secondary,
    },
    type: "light",
  },
});
