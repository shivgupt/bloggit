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
      {Object.keys(posts).map((topic) => {
        console.log(topic)
        return Object.keys((posts as any)[topic]).map((post) => {
          console.log(post)
          return <RenderPosts postPath={(posts as any)[topic][post]} />
        })
      })}

      </header>
    </div>
  );
}

export default App;
