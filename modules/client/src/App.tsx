import React, { useState, useEffect } from 'react';
import {
  PostCardsLists,
  PostPage,
} from './components/Posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
import { PostData } from './types';
import { getPostsByCategories, getPosts, getPostIndex } from './utils';

import {
  createStyles,
  makeStyles,
  Container,
  CssBaseline,
  Theme,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    height: '100%',
    width: '100%',
  },
}),);

const App: React.FC = () => {
  const classes = useStyles();
  const [node, setNode] = useState({
    parent: null,
    current: 'categories',
    child: 'posts',
  });
  const [posts, setPosts] = useState([] as PostData[]);
  const [indexTitle, setIndexTitle] = useState('');

  useEffect(() => {
    (async () => {
      setPosts((await getPosts()));
      const index = await getPostIndex();
      setIndexTitle(index.title);
      document.title = index.title;
    })()
  }, []);

  return (
    <div>
      <CssBaseline />
      <Container maxWidth="lg">
        <NavBar node={node} setNode={setNode} posts={getPostsByCategories(posts)}/>
        <main>
          <Switch>
            <Route exact path={["/", "/home"]} >
              <PostCardsLists posts={posts} indexTitle={indexTitle} />
            </Route>
            <Route
              path="/post/:slug"
              render={
                ({ match }) => <PostPage indexTitle={indexTitle} posts={posts} setPosts={setPosts} slug={match.params.slug} />
              }
            />
          </Switch>
        </main>
      </Container>
    </div>
  );
}

export default App;
