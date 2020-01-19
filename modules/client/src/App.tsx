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
  const [content, setContent] = useState({});
  const [currentSlug, setCurrentSlug] = useState("");
  const [title, setTitle] = useState({ primary: "", secondary: "" });

  // Once: get the content index
  useEffect(() => {
    (async () => setIndex(await fetchIndex()))();
  }, []);

  // Set post content & data if slug or index changes
  useEffect(() => {
    (async () => {
      const currentContent = await fetchContent(currentSlug);
      setContent({ ...content, [currentSlug]: currentContent });
    })();
  // eslint-disable-next-line
  }, [index, currentSlug]);

  // Update the title when the index or current post changes
  useEffect(() => {
    const post = index.posts.find(post => post.slug === currentSlug);
    setTitle({
      primary: index ? index.title : "My personal website",
      secondary: post ? post.title : "",
    });
  // eslint-disable-next-line
  }, [index, currentSlug]);

  // Update the document title when the title changes
  useEffect(() => {
    document.title = title.secondary ? `${title.secondary} | ${title.primary}` : title.primary;
  }, [title]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Container maxWidth="lg">
        <NavBar
          node={node}
          setNode={setNode}
          content={content}
          posts={getPostsByCategories(index.posts)}
          title={title}
        />
        <main className={classes.main}>
          <Switch>
            <Route exact
              path="/"
              render={() => {
                setCurrentSlug("");
                return (<Home
                  posts={index.posts}
                  title={title}
                />);
              }}
            />
            <Route
              path="/post/:slug"
              render={({ match }) => {
                setCurrentSlug(match.params.slug);
                return (<PostPage
                  content={content[match.params.slug] || "Loading"}
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
