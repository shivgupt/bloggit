import {
  Container,
  CssBaseline,
  Theme,
  createStyles,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch} from "react-router-dom";
import axios from "axios";

import { Home } from "./components/Home";
import { AdminHome } from "./components/AdminHome";
import { NavBar } from "./components/NavBar";
import { PostPage } from "./components/Posts";
import {
  emptyEntry,
  fetchContent,
  fetchIndex,
  fetchRef,
  initialGitState,
} from "./utils";
import { darkTheme, lightTheme } from "./style";
import { store } from "./utils/cache";
import { GitContext } from "./GitContext";
import { AdminMode, GitState } from "./types";
import { EditPost } from "./components/EditPost";
import { AppSpeedDial } from "./components/AppSpeedDial";

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
  },
  main: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    padding: theme.spacing(0.25),
  },
}));

const App: React.FC = () => {
  const classes = useStyles();

  const [gitState, setGitState] = useState(initialGitState);
  const [theme, setTheme] = useState(lightTheme);
  const [adminMode, setAdminMode] = useState<AdminMode>("invalid");

  const [newPostData, setNewPostData] = useState(emptyEntry);
  const [newContent, setNewContent] = useState("");
  const [editMode, setEditMode] = useState(false);

  const slugMatch = useRouteMatch("/:slug");
  const refMatch = useRouteMatch("/:ref/:slug");
  const refParam = refMatch ? refMatch.params.ref : "";
  const slugParam = refMatch ? refMatch.params.slug
    : slugMatch ? slugMatch.params.slug
    : "";

  // console.log(`Rendering App with refParam=${refParam} and slugParam=${slugParam}`);

  const validateAuthToken = async (_authToken?: string) => {
    const authToken = _authToken || store.load("authToken");
    try {
      await axios({
        headers: {
          "authorization": `Basic ${btoa(`admin:${authToken}`)}`,
        },
        method: "post",
        url: "git",
      });
      // Auth is valid, update localStorage, axios header and adminMode
      store.save("authToken", authToken);
      axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:${authToken}`)}`;
      setAdminMode("disabled");
    } catch (e) {
      // Auth is invalid, update localStorage, axios header and adminMode
      console.error(`Auth token is not valid: ${e.message}`);
      store.save("authToken", "");
      axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:`)}`;
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

  const syncGitState = async (ref?: string, slug?: string) => {
    const latestRef = await fetchRef();
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
      newGitState.indexEntry = index.posts?.[slug] || index.drafts?.[slug];
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
    setNewContent("");
    setEditMode(false);
    syncGitState(refParam || gitState.latestRef, slugParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam, slugParam]);

  useEffect(() => {
    if (editMode) {
      setNewContent(gitState.currentContent);
      setNewPostData(gitState.indexEntry);
    }
  }, [editMode, gitState]);

  return (
    <ThemeProvider theme={theme}>
      <GitContext.Provider value={{ gitState, syncGitState }}>
        <CssBaseline />
        <NavBar
          adminMode={adminMode}
          setAdminMode={setAdminMode}
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
                render={() => {
                  return editMode
                  ? <EditPost
                    postData={newPostData}
                    content={newContent}
                    setPostData={setNewPostData}
                    setContent={setNewContent}
                  />
                  : <Home />
                }}
              />
              <Route exact
                path="/admin"
                render={() => {
                  return (
                    <AdminHome adminMode={adminMode} validateAuthToken={validateAuthToken} />
                  );
                }}
              />
              <Route
                path="/:ref/:slug"
                render={() => <PostPage />}
              />
              <Route
                path="/:slug"
                render={() => {
                  return editMode
                  ? <EditPost
                      postData={newPostData}
                      content={newContent}
                      setPostData={setNewPostData}
                      setContent={setNewContent}
                    /> 
                  : <PostPage />
                }}
              />
            </Switch>
            {(adminMode === "enabled")
            ? <AppSpeedDial
                newContent={newContent}
                newPostData={newPostData}
                editMode={editMode}
                setEditMode={setEditMode}
              />
            : null}
          </Container>
        </main>
      </GitContext.Provider>
    </ThemeProvider>
  );
};

export default App;
