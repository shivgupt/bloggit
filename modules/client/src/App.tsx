import React, { useState, useEffect } from 'react';
import './App.css';
import { PostPage, PostCard } from './components/Posts';
import { NavBar } from './components/NavBar';
import { Route, Switch } from 'react-router-dom';
import { getPostData, getPostIndex } from './utils';
import { PostData } from './types';

const RenderPostCards = () => {

  const [posts, setPosts] = useState([] as PostData[]);

  useEffect(() => {
    (async () => {
      const posts = await getPostIndex();
      //console.log(posts)
      setPosts(posts)
    })()
  }, []);

  return (
    <>
      {posts.map((post) => {
        //console.log(post)
        return <PostCard key={post.slug} post={post} />
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
          path="/post/:path"
          render={
            ({ match }) => <PostPage post={getPostData(match.params.path)} />
          }
        />
      </Switch>
      </header>
    </div>
  );
}

export default App;
