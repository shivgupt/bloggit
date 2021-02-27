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
} from "./utils";
import { darkTheme, lightTheme } from "./style";
import { store } from "./utils/cache";
import { AdminContext } from "./AdminContext";
import { GitState, SidebarNode } from "./types";
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

  const [gitState, setGitState] = useState({} as GitState);
  const [node, setNode] = useState({} as SidebarNode);
  const [theme, setTheme] = useState(lightTheme);
  const [authToken, setAuthToken] = useState("");
  const [adminMode, setAdminMode] = useState(true);


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

  const updateAuthToken = (authToken: string) => {
    setAuthToken(authToken);
    store.save("authToken", authToken);
  };

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
    console.log(`Syncing ref ${currentRef}${slug ? ` and slug ${slug}` : ""}`);
    if (slug && !["admin", "create-new-post"].includes(slug)) {
      newGitState.currentContent = await fetchContent(slug, currentRef)
      newGitState.indexEntry = index.posts?.[slug] || index.drafts?.[slug];
    } else {
      newGitState.currentContent = "Does Not Exist";
      newGitState.indexEntry = emptyEntry;
    }
    setGitState(newGitState);

    // Update sidebar node
    if (slug !== "" && index?.posts?.[slug || ""]){
      setNode({ parent: "posts", current: "toc", child: index?.posts?.[slug || ""] });
    } else {
      setNode({ parent: "", current: "categories", child: "posts" });
    }
  }

  // Run this effect exactly once when the page initially loads
  useEffect(() => {
    window.scrollTo(0, 0);
    // Set theme to local preference
    // console.log("Setting theme & loading authToken");
    const themeSelection = store.load("theme");
    if (themeSelection === "light") setTheme(lightTheme);
    else setTheme(darkTheme);
    // Check local storage for admin edit keys
    const key = store.load("authToken");
    if (key) setAuthToken(key);
  }, []);

  // Fetch index & post content any time the url changes
  useEffect(() => {
    setNewContent("");
    setEditMode(false);
    syncGitState(refParam || gitState.latestRef, slugParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam, slugParam]);

  // Update auth headers any time the authToken changes
  useEffect(() => {
    axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:${authToken}`)}`;
  }, [authToken]);

  return (
    <ThemeProvider theme={theme}>
      <AdminContext.Provider
        value={{ gitState, syncGitState, authToken, editMode, setEditMode, newContent, setNewContent, updateAuthToken, adminMode, setAdminMode }}
      >
        <CssBaseline />
        <NavBar
          gitState={gitState}
          node={node}
          setNode={setNode}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className={classes.main}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <Switch>
              <Route exact
                path="/"
                render={() => {
                  return (
                    <Home gitState={gitState} />
                  );
                }}
              />
              <Route exact
                path="/admin"
                render={() => {
                  return (
                    <AdminHome />
                  );
                }}
              />
              <Route exact
                path="/create-new-post"
                render={() => {
                  return <EditPost
                    postData={newPostData}
                    content={newContent}
                    setPostData={setNewPostData}
                    setContent={setNewContent}
                  />;
                }}
              />
              <Route
                path="/:ref/:slug"
                render={() => <PostPage gitState={gitState} />}
              />
              <Route
                path="/:slug"
                render={() => <PostPage gitState={gitState} />}
              />
            </Switch>
            {(adminMode && authToken) ? <AppSpeedDial gitState={gitState} /> : null}
          </Container>
        </main>
      </AdminContext.Provider>
    </ThemeProvider>
  );
};

export default App;
