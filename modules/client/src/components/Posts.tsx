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

import { getPostContent } from '../posts';
import { PostData } from '../types';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 345,
  },
}));

export const PostPage = (props: any) => {
  const [postData, setPostData] = useState({} as PostData);
  const [postMd, setPostMd] = useState('');

  useEffect(() => {
    (async () => {
      // console.log(props.post)
      const resolvedPost = await props.post
      console.log(`Rendering post ${resolvedPost.slug} at path ${resolvedPost.path}`);
      setPostMd(await getPostContent(resolvedPost.slug));
    })()
  }, [props.post]);

  return (
    <ReactMarkdown source={postMd} />
  )
}

export const PostCard = (props: any) => {
  const classes = useStyles();

  if (!props.post) {
    return <> Loading </>
  }

  return (
     <Card className={classes.card}>
      <CardHeader title={props.post.title} />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.post.tldr}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          component={Link}
          to={`/post/${props.post.slug}`}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}
