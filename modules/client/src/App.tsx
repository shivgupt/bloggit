import React from 'react';
import './App.css';
import { PostPage, PostCard } from './components/Posts';
import * as posts from './posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';

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
  return (
    <div className="App">
      <NavBar />
      <header className="App-header">
      <Switch>
        <Route exact path={["/", "/home"]} >
          <RenderPostCards />
        </Route>
        <Route
          exact
          path="/post/:path"
          render={({ match }) => { return <PostPage postPath={match.params.path} /> }}
        />
      </Switch>
      </header>
    </div>
  );
}

export default App;
