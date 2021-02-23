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
  emptyIndex,
  fetchRef,
  fetchContent,
  fetchIndex,
  getPostsByCategories,
} from "./utils";
import { darkTheme, lightTheme } from "./style";
import { store } from "./utils/cache";
import { AdminContext } from "./AdminContext";
import { SidebarNode } from "./types";
import { CreateNewPost } from "./components/CreateNewPost";
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

  const slugMatch = useRouteMatch("/:slug");
  const refMatch = useRouteMatch("/:ref/:slug");
  const refParam = refMatch ? refMatch.params.ref : "";
  const slugParam = refMatch ? refMatch.params.slug
    : slugMatch ? slugMatch.params.slug
    : "";

  const [ref, setRef] = useState(refParam);
  const [slug, setSlug] = useState(slugParam);
  const [content, setContent] = useState("Loading...");

  const [node, setNode] = useState({} as SidebarNode);
  const [theme, setTheme] = useState(lightTheme);
  const [index, setIndex] = useState(emptyIndex);
  const [title, setTitle] = useState({ site: "", page: "" });
  const [authToken, setAuthToken] = useState("");
  const [adminMode, setAdminMode] = useState(true);
  const [allContent, setAllContent] = useState({});

  // console.log(`Rendering App with ref=${ref} (${refParam}) and slug=${slug} (${slugParam})`);
  const updateAuthToken = (authToken: string) => {
    setAuthToken(authToken);
    store.save("authToken", authToken);
  };

  const viewAdminMode = (viewAdminMode: boolean) => setAdminMode(viewAdminMode);

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

  const syncRef = async (
    _ref?: string | null,
    slug?: string | null,
  ) => {
    const newRef = _ref || await fetchRef();
    console.log(`Syncing ref ${newRef}${slug ? ` and slug ${slug}` : ""}`);
    // if ref is not the commit, then it's immutable & never needs to be refreshed
    const newIndex = await fetchIndex(newRef);
    if (slug) {
      if (!allContent[newRef]) {
        allContent[newRef] = {};
      }
      allContent[newRef][slug] = await fetchContent(slug!, newRef);
      setContent(allContent[newRef][slug]);
      setAllContent(allContent);
    }
    setIndex(JSON.parse(JSON.stringify(newIndex))); // new object forces a re-render
    setRef(newRef);
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
    if (slugParam === "admin" || slugParam === "create-new-post") return;
    setContent("Loading..");
    setSlug(slugParam);
    (async () => {
      try {
        await syncRef(refParam, slugParam);
      } catch (e) {
        console.warn(e.message);
        allContent[refParam][slugParam] = "Post does not exist";
        setContent(allContent[refParam][slugParam]);
        setAllContent(allContent);
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam, slugParam]);

  // Update auth headers any time the authToken changes
  useEffect(() => {
    axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:${authToken}`)}`;
  }, [authToken]);

  // Update the title & sidebar node when the index or slug changes
  useEffect(() => {
    // Update title
    // console.log("Setting title & sidebar node");
    const siteTitle = index ? index.title : "My personal website";
    const pageTitle = index.posts[slug] ? index.posts[slug].title : "";
    document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;
    setTitle({ site: siteTitle, page: pageTitle });
    // Update sidebar node
    if (slug !== "" && index.posts[slug]){
      setNode({ parent: "posts", current: "toc", child: index.posts[slug] });
    } else {
      setNode({ parent: "", current: "categories", child: "posts" });
    }
  }, [slug, index]);

  return (
    <ThemeProvider theme={theme}>
      <AdminContext.Provider
        value={{ syncRef, authToken, index, updateAuthToken, adminMode, viewAdminMode }}
      >
        <CssBaseline />
        <NavBar
          node={node}
          allContent={allContent}
          posts={getPostsByCategories(index.posts)}
          gitRef={ref}
          setNode={setNode}
          theme={theme}
          title={title}
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
                    <Home
                      posts={index.posts}
                      title={title}
                    />
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
                  return <CreateNewPost />;
                }}
              />
              <Route
                path="/:ref/:slug"
                render={() => <PostPage content={content} slug={slug} gitRef={ref} />}
              />
              <Route
                path="/:slug"
                render={() => <PostPage content={content} slug={slug} gitRef={ref} />}
              />
            </Switch>
            { adminMode && authToken ? <AppSpeedDial /> : null }
          </Container>
        </main>
      </AdminContext.Provider>
    </ThemeProvider>
  );
};

export default App;
