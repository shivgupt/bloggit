import { createMuiTheme } from "@material-ui/core";
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
      main: "#702c40",
    },
    secondary: {
      main: "#2a706b",
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