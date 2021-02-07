import { createMuiTheme } from "@material-ui/core";
import "@fontsource/monsieur-la-doulaise";

export const siteTitleFont = createMuiTheme({
  typography: {
    fontFamily: [
    ].join(","),
  },
});

export const darkTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#2e3241",
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
      main: "#88969f",
    },
    secondary: {
      main: "#8bcfcf",
    },
    type: "light",
  },
});
