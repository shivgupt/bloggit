import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export const RenderPosts = (props: any) => {
  const [postmd, setPostmd] = useState('');

  useEffect(() => {
    //const postPath = require(`../posts/${props.post}.md`);

    fetch(props.postPath).then(
      res => res.text()
    ).then(text => {
      setPostmd(text)
    })
  });

  return (
    <ReactMarkdown source={postmd} />
  )
}
