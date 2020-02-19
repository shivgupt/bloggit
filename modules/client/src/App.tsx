import {
  Container,
  CssBaseline,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";

import { Home } from "./components/Home";
import { NavBar } from "./components/NavBar";
import { PostPage } from "./components/Posts";
import { emptyIndex, fetchContent, fetchIndex, getPostsByCategories } from "./utils";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    backgroundColor: "linen",
  },
  main: {
    marginTop: "80px",
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
    <div className={classes.root}>
      <CssBaseline />
      <Container maxWidth="lg">
        <NavBar
          node={node}
          setNode={setNode}
          posts={getPostsByCategories(index.posts)}
          title={title}
        />
        <main className={classes.main}>
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
        </main>
      </Container>
    </div>
  );
};

export default App;
