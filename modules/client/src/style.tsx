//import { createMuiTheme } from "@material-ui/core";
import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core';
import "@fontsource/monsieur-la-doulaise";

export const siteTitleFont = createMuiTheme({
  typography: {
    fontFamily: [
      "Monsieur La Doulaise",
    ].join(","),
  },
});

export const darkTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#91374f",
    },
    secondary: {
      main: "#379179",
    },
    type: "dark",
  },
});

export const lightTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#f2bcc8",
    },
    secondary: {
      main: "#8bcfcf",
    },
    type: "light",
  },
});