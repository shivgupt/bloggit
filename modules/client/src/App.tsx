import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";
import { Theme, ThemeProvider } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Route, Routes, useMatch } from "react-router-dom";

import { AdminHome } from "./components/AdminHome";
import { PostEditor } from "./components/PostEditor";
import { Home } from "./components/Home";
import { NavBar } from "./components/NavBar";
import { PostPage } from "./components/Posts";
import { GitContext } from "./GitContext";
import { darkTheme, lightTheme, getFabStyle } from "./style";
import { AdminMode, GitState, SnackAlert } from "./types";
import {
  defaultSnackAlert, 
  emptyEntry,
  fetchContent,
  fetchIndex,
  fetchRef,
  initialGitState,
  store,
} from "./utils";

const StyledContainer = styled("Container")(({ theme }) => ({
    [theme.breakpoints.up("lg")]: {
      width: "80%",
      marginRight: "20%",
    },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
}));

const App: React.FC = () => {
  const [gitState, setGitState] = useState(initialGitState);
  const [theme, setTheme] = useState(darkTheme);
  const [adminMode, setAdminMode] = useState<AdminMode>("invalid");
  const [snackAlert, setSnackAlert] = useState<SnackAlert>(defaultSnackAlert);

  const createMatch = useMatch({ path: "/admin/create", exact: true, strict: true });
  const editIndexMatch = useMatch({ path: "/admin/edit", exact: true, strict: true });
  const categoryMatch = useMatch({ path: "/category/:category", exact: true, strict: true });
  const editMatch = useMatch({ path: "/admin/edit/:slug", exact: true, strict: true });
  const refMatch = useMatch({ path: "/:ref/:slug", exact: true, strict: true });
  const slugMatch = useMatch({ path: "/:slug", exact: true, strict: true });

  const categoryParam = (
    (createMatch || editIndexMatch) ? ""
    : categoryMatch ? categoryMatch.params.category
    : ""
  ).toLowerCase();

  const refParam = (
    (categoryParam || createMatch || editMatch || editIndexMatch) ? ""
    : refMatch ? refMatch.params.ref
    : ""
  ).toLowerCase();

  const slugParam = (
    (categoryParam || createMatch || editIndexMatch) ? ""
    : refParam ? refMatch.params.slug
    : editMatch ? editMatch.params.slug
    : slugMatch ? slugMatch.params.slug
    : ""
  ).toLowerCase();

  console.log(`Rendering App w url params: category="${categoryParam}" | ref="${refParam}" | slug="${slugParam}"`);

  const validateAuthToken = async (_authToken?: string) => {
    if (_authToken === "") {
      store.save("authToken", _authToken);
      setSnackAlert({
        open: true,
        msg: "Auth token removed",
        severity: "success",
        hideDuration: 4000,
      });
      setAdminMode("invalid");
      return;
    }
    const authToken = _authToken || store.load("authToken");
    try {
      await axios({
        headers: {
          "authorization": `Basic ${btoa(`admin:${authToken}`)}`,
        },
        method: "post",
        url: "/git",
      });
      // Auth is valid, update localStorage, axios header and adminMode
      store.save("authToken", authToken);
      axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:${authToken}`)}`;
      if (_authToken) {
        setSnackAlert({
          open: true,
          msg: "Auth token registered",
          severity: "success",
          hideDuration: 4000,
        });
      }
      setAdminMode("enabled");
    } catch (e) {
      // Got unauthorized response, update localStorage, axios header and adminMode
      if (e?.response?.status === 401) {
        console.error(`Auth token is not valid:`, e);
        store.save("authToken", "");
        axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:`)}`;
        if (_authToken) {
          setSnackAlert({
            open: true,
            msg: "Invalid Auth Token",
            severity: "error",
            hideDuration: 4000,
          });
        }
        setAdminMode("invalid");
      } else {
        console.error(`Non-auth server failure:`, e);
      }
    }
  };

  const toggleTheme = () => {
    if (theme.palette.type === "dark") {
      store.save("theme", "light");
      setTheme(lightTheme);
    } else {
      store.save("theme", "dark");
      setTheme(darkTheme);
    }
  };

  const syncGitState = async (ref?: string, slug?: string, getLatest?: boolean) => {
    const latestRef = (getLatest ? null : gitState.latestRef) || await fetchRef();
    const currentRef = ref || "";
    const newGitState = {
      latestRef,
      currentRef,
      slug: slug || "",
      index: await fetchIndex(latestRef),
    } as GitState;
    // console.log(`Syncing ref ${currentRef}${slug ? ` and slug ${slug}` : ""}`);
    if (slug && !["admin", "create"].includes(slug)) {
      newGitState.currentContent = await fetchContent(slug, currentRef || latestRef);
      newGitState.indexEntry =
        (await fetchIndex(currentRef || latestRef))?.posts?.[slug] || emptyEntry;
    } else {
      newGitState.currentContent = "";
      newGitState.indexEntry = emptyEntry;
    }
    setGitState(newGitState);
  };

  // Run this effect exactly once when the page initially loads
  useEffect(() => {
    window.scrollTo(0, 0);
    // Set theme to local preference
    // console.log("Setting theme & loading authToken");
    const themeSelection = store.load("theme");
    if (themeSelection === "light") setTheme(lightTheme);
    else setTheme(darkTheme);
    validateAuthToken();
  }, []);

  // Fetch index & post content whenever the url changes
  useEffect(() => {
    syncGitState(refParam, slugParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam, slugParam]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryParam]);

  useEffect(() => {
    console.log(`Admin mode set to "${adminMode}"`);
  }, [adminMode]);

  return (
    <ThemeProvider theme={theme}>
      <GitContext.Provider value={{ gitState, syncGitState }}>
        <CssBaseline />
        <NavBar
          adminMode={adminMode}
          category={categoryParam}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main>
          <StyledContainer maxWidth="xl">
            <Routes>
              <Route exact strict
                path="/"
                render={() => (<Home adminMode={adminMode} />)}
              />
              <Route exact strict
                path="/category/:category"
                render={() => (<Home
                  adminMode={adminMode}
                  filterBy={categoryParam}
                />)}
              />
              <Route exact strict
                path="/admin"
                render={() => (<AdminHome
                  adminMode={adminMode}
                  setAdminMode={setAdminMode}
                  validateAuthToken={validateAuthToken}
                />)}
              />
              <Route exact strict
                path="/admin/create"
                render={() => (<PostEditor setSnackAlert={setSnackAlert} />)}
              />
              <Route exact strict
                path="/admin/edit/:slug"
                render={() => (<PostEditor setSnackAlert={setSnackAlert} />)}
              />
              <Route exact strict
                path="/:ref/:slug"
                render={() => <PostPage adminMode={adminMode} />}
              />
              <Route exact strict
                path="/:slug"
                render={() => (<PostPage adminMode={adminMode} />)}
              />
            </Routes>
          </StyledContainer>
        </main>
      </GitContext.Provider>
      <Snackbar
        id="snackbar"
        open={snackAlert.open}
        autoHideDuration={snackAlert.hideDuration}
        onClose={() => setSnackAlert(defaultSnackAlert)}
      >
        <Alert severity={snackAlert.severity} action={snackAlert.action}>
          {snackAlert.msg}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
