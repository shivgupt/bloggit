import {
  Container,
  CssBaseline,
  Theme,
  createStyles,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";

import { Home } from "./components/Home";
import { AdminHome } from "./components/AdminHome";
import { NavBar } from "./components/NavBar";
import { PostPage } from "./components/Posts";
import { emptyIndex, fetchFile, fetchContent, fetchIndex, getPostsByCategories } from "./utils";
import { darkTheme, lightTheme } from "./style";
import { store } from "./utils/cache";
import { AdminContext } from "./AdminContext";
import { PostData } from "./types";

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
  const [node, setNode] = useState({} as {
    parent: string | null,
    current: string,
    child: any,
  });
  const [theme, setTheme] = useState(lightTheme);
  const [index, setIndex] = useState(emptyIndex);
  const [currentSlug, setCurrentSlug] = useState("");
  const [title, setTitle] = useState({ site: "", page: "" });
  const [about, setAbout] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [adminMode, setAdminMode] = useState(false);

  const updateAuthToken = (authToken: string) => {
    setAuthToken(authToken);
    store.save("authToken", authToken);
  };

  const viewAdminMode = (viewAdminMode: boolean) => setAdminMode(viewAdminMode);

  // Only once: get the content index
  useEffect(() => {
    (async () => setIndex(await fetchIndex()))();

    // Set top level node
    setNode({
      parent: "",
      current: "categories",
      child: "posts"
    });

    // Set theme to local preference
    const themeSelection = store.load("theme");
    if (themeSelection === "light") setTheme(lightTheme);
    else setTheme(darkTheme);

    // Check local storage for admin edit keys
    const key = store.load("authToken");
    if (key) setAuthToken(key);
  }, []);

  useEffect(() => {
    if (index.about) {
      (async () => setAbout(await fetchFile(index.about)))();
    }
  }, [index]);

  // Set post content if slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      // Do nothing if index isn't loaded yet or content is already loaded
      if (!index.posts[currentSlug] || index.posts[currentSlug].content) {
        return;
      }
      // Need to setIndex to a new object to be sure we trigger a re-render
      const newIndex = JSON.parse(JSON.stringify(index));
      const currentContent = await fetchContent(currentSlug);
      newIndex.posts[currentSlug].content = currentContent;
      setIndex(newIndex);
    })();

    // Set sidebar node
    if (currentSlug !== "" && index.posts[currentSlug]){
      setNode({
        parent: "posts",
        current: "toc",
        child: index.posts[currentSlug],
      });
    } else {
      setNode({
        parent: "",
        current: "categories",
        child: "posts"
      });
    }

    // Update the title when the index or current post changes
    const post = index.posts[currentSlug];
    setTitle({
      site: index ? index.title : "My personal website",
      page: post ? post.title : "",
    });
    document.title = title.page ? `${title.page} | ${title.site}` : title.site;

  // eslint-disable-next-line
  }, [currentSlug, index]);

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

  return (
    <ThemeProvider theme={theme}>
      <AdminContext.Provider value={{ authToken, updateAuthToken, adminMode, viewAdminMode }}>
        <CssBaseline />
        <NavBar
          node={node}
          setNode={setNode}
          posts={getPostsByCategories(index.posts)}
          title={title}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className={classes.main}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <Switch>
              <Route exact
                path="/"
                render={() => {
                  setCurrentSlug("");
                  return (
                    <Home
                      posts={index.posts}
                      title={title}
                    />
                  );
                }}
              />
              <Route exact
                path="/about"
                render={() => {
                  setCurrentSlug("");
                  return (<PostPage post={index.about ?
                    about
                    : "Not added yet" }
                  />);
                }}
              />
              <Route exact
                path="/admin"
                render={() => {
                  setCurrentSlug("");
                  return (
                    <AdminHome />
                  );
                }}
              />
              <Route
                path="/:slug"
                render={({ match }) => {
                  const slug = match.params.slug;
                  setCurrentSlug(slug);
                  return (<PostPage
                    post={
                      index.posts[slug]
                        ? index.posts[slug]
                        : {} as PostData
                    }
                  />);
                }}
              />
            </Switch>
          </Container>
        </main>
      </AdminContext.Provider>
    </ThemeProvider>
  );
};

export default App;