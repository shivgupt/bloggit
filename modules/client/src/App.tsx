import React, { useState, useEffect } from 'react';
import './App.css';
import {
  PostCardsLists,
  PostPage,
} from './components/Posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
import { PostData } from './types';

const App: React.FC = () => {
  const [content, setContent] = useState('Loading');
  const [posts, setPosts] = useState([] as PostData[]);

  return (
    <div className="App">
      <NavBar content={content} posts={posts}/>
      <header className="App-header">
      <Switch>
        <Route exact path={["/", "/home"]} >
          <PostCardsLists posts={posts} setPosts={setPosts} />
        </Route>
        <Route
          path="/post/:slug"
          render={
            ({ match }) => <PostPage content={content} setContent={setContent} slug={match.params.slug} />
          }
        />
      </Switch>
      </header>
    </div>
  );
}

export default App;
