import React, { useState, useEffect } from 'react';
import './App.css';
import {
  PostCardsLists,
  PostPage,
} from './components/Posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
import { PostData } from './types';
import { getPostsByCategories, getPosts, getPostIndex } from './utils';

const App: React.FC = () => {
  //const [content, setContent] = useState('Loading');
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
      console.log(index);
      setIndexTitle(index.title);
      document.title = index.title;

    })()
  }, []);

  return (
    <div className="App">
      <NavBar node={node} setNode={setNode} posts={getPostsByCategories(posts)}/>
      <header className="App-header">
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
      </header>
    </div>
  );
}

export default App;
