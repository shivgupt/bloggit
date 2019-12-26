import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';
import { RenderPosts } from './components/Posts'
import * as posts from './posts'

const App: React.FC = () => {
  const [serverMsg, setServerMsg] = useState('please wait..');

  useEffect(() => {
    (async () => {
      const response = await axios.get('/api/hello')
      setServerMsg(response.data);
    })()
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      {Object.keys(posts).map((post)=> {
        return <RenderPosts postPath={(posts as any)[post]} />
      })}

      </header>
    </div>
  );
}

export default App;
