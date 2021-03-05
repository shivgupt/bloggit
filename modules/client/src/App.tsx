import {
  Container,
  createStyles,
  CssBaseline,
  makeStyles,
  Snackbar,
  Theme,
  ThemeProvider,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { AdminHome } from "./components/AdminHome";
import { EditPost } from "./components/EditPost";
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


const useStyles = makeStyles((theme: Theme) => createStyles({
  appBarSpacer: theme.mixins.toolbar,
  root: {
    display: "flex",
  },
  container: {
    [theme.breakpoints.up("md")]: {
      width: "80%",
      marginRight: "20%",
    },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  main: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    padding: theme.spacing(0.25),
  },
  fab: getFabStyle(theme),
}));

const App: React.FC = () => {
  const classes = useStyles();

  const [gitState, setGitState] = useState(initialGitState);
  const [theme, setTheme] = useState(lightTheme);
  const [adminMode, setAdminMode] = useState<AdminMode>("invalid");
  const [editMode, setEditMode] = useState(false);
  const [snackAlert, setSnackAlert] = useState<SnackAlert>(defaultSnackAlert);

  const categoryMatch = useRouteMatch("/category/:category");
  const slugMatch = useRouteMatch("/:slug");
  const refMatch = useRouteMatch("/:ref/:slug");
  const categoryParam = categoryMatch ? categoryMatch.params.category : "";
  const refParam = categoryParam ? "" : refMatch ? refMatch.params.ref : "";
  const slugParam = categoryParam ? "" : refMatch ? refMatch.params.slug
    : slugMatch ? slugMatch.params.slug
    : "";

  // console.log(`Rendering App with refParam=${refParam} and slugParam=${slugParam} and categoryParam=${categoryParam}`);

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
      // Auth is invalid, update localStorage, axios header and adminMode
      console.error(`Auth token is not valid: ${e.message}`);
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
    }
  }

  const toggleTheme = () => {
    if ( theme.palette.type === "dark") {
      store.save("theme", "light");
      setTheme(lightTheme);
    }
    else {
      store.save("theme", "dark");
      setTheme(darkTheme);
    }
  };

  const syncGitState = async (ref?: string, slug?: string, getLatest?: boolean) => {
    const latestRef = (getLatest ? null : gitState.latestRef) || await fetchRef();
    const currentRef = ref || latestRef;
    const index = await fetchIndex(currentRef);
    const newGitState = {
      latestRef,
      currentRef,
      slug: slug || "",
      index: index,
    } as GitState;
    // console.log(`Syncing ref ${currentRef}${slug ? ` and slug ${slug}` : ""}`);
    if (slug && !["admin", "create-new-post"].includes(slug)) {
      newGitState.currentContent = await fetchContent(slug, currentRef)
      newGitState.indexEntry = index.posts?.[slug];
    } else {
      newGitState.currentContent = "";
      newGitState.indexEntry = emptyEntry;
    }
    setGitState(newGitState);
  }

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

  // Fetch index & post content any time the url changes
  useEffect(() => {
    window.scrollTo(0, 0);
    syncGitState(refParam || gitState.latestRef, slugParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam, slugParam]);

  return (
    <ThemeProvider theme={theme}>
      <GitContext.Provider value={{ gitState, syncGitState }}>
        <CssBaseline />
        <NavBar
          adminMode={adminMode}
          theme={theme}
          toggleTheme={toggleTheme}
          setEditMode={setEditMode}
        />
        <main className={classes.main}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <Switch>
              <Route exact
                path="/"
                render={() => (editMode
                  ? <EditPost setEditMode={setEditMode} setSnackAlert={setSnackAlert} />
                  : <Home adminMode={adminMode} setEditMode={setEditMode} />
                )}
              />
              <Route exact
                path="/category/:slug"
                render={() => (<Home
                  adminMode={adminMode}
                  filterBy={categoryParam}
                  setEditMode={setEditMode}
                />)}
              />
              <Route exact
                path="/admin"
                render={() => (<AdminHome
                  adminMode={adminMode}
                  setAdminMode={setAdminMode}
                  setEditMode={setEditMode}
                  validateAuthToken={validateAuthToken}
                />)}
              />
              <Route
                path="/:ref/:slug"
                render={() => <PostPage adminMode={adminMode} setEditMode={setEditMode} />}
              />
              <Route
                path="/:slug"
                render={() => (editMode
                  ? <EditPost setEditMode={setEditMode} setSnackAlert={setSnackAlert} />
                  : <PostPage adminMode={adminMode} setEditMode={setEditMode} />
                )}
              />
            </Switch>
          </Container>
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
