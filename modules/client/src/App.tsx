import axios from 'axios';
import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { RenderPosts } from './components/Posts'

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
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Server says: {serverMsg}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      <RenderPosts post={'hello-world'} />
      </header>
    </div>
  );
}

export default App;
