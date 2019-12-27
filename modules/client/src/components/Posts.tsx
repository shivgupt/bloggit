import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  makeStyles,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { PostData } from '../types';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 345,
  },
}));

export const PostPage = (props: any) => {
  const [postmd, setPostmd] = useState('');

  useEffect(() => {
    //const postPath = require(`../posts/${props.post}.md`);

    fetch(props.postPath).then(
      res => res.text()
    ).then(text => {
      setPostmd(text)
    })
  }, [props.postPath]);

  return (
    <ReactMarkdown source={postmd} />
  )
}

export const PostCard = (props: any) => {
  const classes = useStyles();
  const [post, setPost] = useState({} as PostData);

  useEffect(() => {
    setPost(props.post)
  }, [props.post]);

  if (!post) {
    return <> Loading </>
  }

  return (
     <Card className={classes.card}>
      <CardHeader title={post.title} />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {post.tldr}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          component={Link}
          to={`/post${post.path}`}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}
