import React, { useState, useEffect } from 'react';
import './App.css';
import {
  PostCardsLists,
  PostPage,
} from './components/Posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
import { PostData } from './types';
import { getPostsByCategories, getPostIndex } from './utils';

const App: React.FC = () => {
  //const [content, setContent] = useState('Loading');
  const [node, setNode] = useState({
    parent: null,
    current: 'categories',
    child: 'posts',
  });
  const [posts, setPosts] = useState([] as PostData[]);

  useEffect(() => {
    (async () => {
      setPosts((await getPostIndex()));
    })()
  }, []);

  return (
    <div className="App">
      <NavBar node={node} setNode={setNode} posts={getPostsByCategories(posts)}/>
      <header className="App-header">
      <Switch>
        <Route exact path={["/", "/home"]} >
          <PostCardsLists posts={posts} />
        </Route>
        <Route
          path="/post/:slug"
          render={
            ({ match }) => <PostPage posts={posts} setPosts={setPosts} slug={match.params.slug} />
          }
        />
      </Switch>
      </header>
    </div>
  );
}

export default App;
