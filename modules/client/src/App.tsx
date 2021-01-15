import {
  Container,
  CssBaseline,
  Theme,
  createStyles,
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";

import { Home } from "./components/Home";
import { NavBar } from "./components/NavBar";
import { PostPage } from "./components/Post";
import { emptyIndex, fetchContent, fetchIndex, getPostsByCategories } from "./utils";

const darkTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#deaa56",
    },
    secondary: {
      main: "#e699a6",
    },
    type: "dark",
  },
});

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
  const [index, setIndex] = useState(emptyIndex);
  const [currentSlug, setCurrentSlug] = useState("");
  const [title, setTitle] = useState({ site: "", page: "" });

  // Only once: get the content index
  useEffect(() => {
    (async () => setIndex(await fetchIndex()))();
  }, []);

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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <NavBar
        node={node}
        setNode={setNode}
        posts={getPostsByCategories(index.posts)}
        title={title}
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
                  <Home index={index} />
                );
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
