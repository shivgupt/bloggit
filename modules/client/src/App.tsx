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
import { NavBar } from "./components/NavBar";
import { PostPage } from "./components/Posts";
import { emptyIndex, fetchAbout, fetchContent, fetchIndex, getPostsByCategories } from "./utils";
import { darkTheme, lightTheme } from "./style";

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
    padding: theme.spacing(3),
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [node, setNode] = useState({
    parent: null,
    current: "categories",
    child: "posts",
  });
  const [theme, setTheme] = useState(darkTheme);
  const [index, setIndex] = useState(emptyIndex);
  const [currentSlug, setCurrentSlug] = useState("");
  const [title, setTitle] = useState({ site: "", page: "" });
  const [about, setAbout] = useState("");

  // Only once: get the content index
  useEffect(() => {
    (async () => setIndex(await fetchIndex()))();
  }, []);

  useEffect(() => {
    if (index.about) {
      (async () => setAbout(await fetchAbout(index.about)))();
    }
  }, [index]);

  // Set post content if slug changes
  useEffect(() => {
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
  // eslint-disable-next-line
  }, [currentSlug, index]);

  // Update the title when the index or current post changes
  useEffect(() => {
    const post = index.posts[currentSlug];
    setTitle({
      site: index ? index.title : "My personal website",
      page: post ? post.title : "",
    });
    document.title = title.page ? `${title.page} | ${title.site}` : title.site;
  // eslint-disable-next-line
  }, [index, currentSlug]);

  const toggleTheme = () => {
    if ( theme.palette.type === "dark")
      setTheme(lightTheme);
    else
      setTheme(darkTheme);
  };

  return (
    <ThemeProvider theme={theme}>
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
                return (<PostPage content={index.about ?
                  about
                  : "Not added yet" }
                />);
              }}
            />
            <Route
              path="/:slug"
              render={({ match }) => {
                const slug = match.params.slug;
                setCurrentSlug(slug);
                return (<PostPage
                  content={
                    index.posts[slug]
                      ? (index.posts[slug].content || "Loading Page")
                      : "Loading Index"
                  }
                />);
              }}
            />
          </Switch>
        </Container>
      </main>
    </ThemeProvider>
  );
};

export default App;
