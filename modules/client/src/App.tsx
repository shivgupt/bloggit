import React, { useState } from 'react';
import './App.css';
import { PostPage, PostCard } from './components/Posts';
import * as posts from './posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
import { PostData } from './types';

const getPostData = (slug: string) => {
  for(let post of Object.keys(posts)) {
    if ((posts as any)[post].slug === slug) {
      return (posts as any)[post]
    }
  }
}

const RenderPostCards = () => {
  return (
    <>
    {Object.keys(posts).map((post) => {
      console.log((posts as any)[post])
      return <PostCard post={(posts as any)[post]} />
    })}
    </>
  )
}

const App: React.FC = () => {
  //const [post, setPost] = useState({} as PostData);
  return (
    <div className="App">
      <NavBar />
      <header className="App-header">
      <Switch>
        <Route exact path={["/", "/home"]} >
          <RenderPostCards />
        </Route>
        <Route
          path="/post/:path"
          render={({ match }) => { return <PostPage post={getPostData(match.params.path)} /> }}
        />
      </Switch>
      </header>
    </div>
  );
}

export default App;
