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
import { emptyIndex, fetchIndex, getPostsByCategories } from "./utils";

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
  const [title, setTitle] = useState({ primary: "", secondary: "" });

  // Once: get the content index
  useEffect(() => {
    (async () => setIndex(await fetchIndex()))();
  }, []);

  // Update the title when the content index changes
  useEffect(() => {
    setTitle({ ...title, primary: index.title });
  // eslint-disable-next-line
  }, [index]);

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
          posts={getPostsByCategories(index.posts)}
          title={title}
        />
        <main className={classes.main}>
          <Switch>
            <Route exact path="/">
              <Home
                posts={index.posts}
                title={title}
                setTitle={setTitle}
              />
            </Route>
            <Route
              path="/post/:slug"
              render={({ match }) =>
                <PostPage
                  title={title}
                  setTitle={setTitle}
                  index={index}
                  slug={match.params.slug}
                />
              }
            />
          </Switch>
        </main>
      </Container>
    </div>
  );
};

export default App;
