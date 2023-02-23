import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { darkTheme } from "./style";

const root = createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <Router>
      <ThemeProvider theme={darkTheme}>
        <App />
      </ThemeProvider>
    </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
