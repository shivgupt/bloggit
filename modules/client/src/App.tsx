import React from 'react';
import './App.css';
import { RenderPosts } from './components/Posts';
import * as posts from './posts';
import { NavBar } from './components/NavBar';

const App: React.FC = () => {
  return (
    <div className="App">
      <NavBar />
      <header className="App-header">
      {Object.keys(posts).map((post) => {
        console.log((posts as any)[post])
        return <RenderPosts postPath={(posts as any)[post].path} />
      })}

      </header>
    </div>
  );
}

export default App;
