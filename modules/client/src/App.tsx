import React, { useState } from 'react';
import './App.css';
import { PostPage, PostCard } from './components/Posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
import { getPostData, getPostIndex } from './posts';

getPostIndex();

const RenderPostCards = () => {
  return (
    <div>
    </div>
  )
}

const App: React.FC = () => {
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
