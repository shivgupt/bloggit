import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { CodeBlockRenderer } from './CodeBlock';

import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Paper,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons';

import { getPostContent } from '../utils';

import { HeadingRenderer } from './HeadingRenderer';

const useStyles = makeStyles((theme: Theme) => createStyles({
  card: {
    width: 345,
    height: 245,
  },
  root: {
    flexGrow: 1,
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
}),);

export const PostPage = (props: any) => {
  const classes = useStyles();
  const [postIndex, setPostIndex] = useState(-2);
  const {posts, setPosts, indexTitle} = props;

  useEffect(() => {
    if (posts.length > 0) {
      let index = posts.findIndex((p) => p.slug === props.slug);
      setPostIndex(index);
    }

    if (window.location.hash) {
      // TODO: Find a better way to focus at sub-section at time of load.
      // This is pretty hacky
      // eslint-disable-next-line
      window.location.hash = window.location.hash;
    }
  }, [props.slug, posts]);

  useEffect(() => {
    (async () => {
      if (postIndex >= 0 && !posts[postIndex].content) {
        const postContent = await getPostContent(posts[postIndex].slug);
        if (postContent) {
          posts[postIndex].content = postContent;
          setPosts([
            ...posts,
          ])
        }
        document.title = `${posts[postIndex].title} | ${indexTitle}`
      }
    })()
  }, [postIndex, indexTitle]);

  return (
    <Paper variant="outlined">
      <Markdown
        source={postIndex === -1 ? 'Post Does Not Exist' : (postIndex === -2 ? 'Loading' : posts[postIndex].content)}
        className={classes.text}
        renderers={{ heading: HeadingRenderer, code: CodeBlockRenderer }}
      />
    </Paper>
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

export const PostCardsLists = (props: any) => {

  const {posts, indexTitle} = props;
  const classes = useStyles();

  useEffect(() => {
    document.title = indexTitle;
  }, [indexTitle]);

  return (
    <div className={classes.root}>
    <Grid container spacing={3} justify={'space-around'} alignItems={'center'}>
      {posts.map((post) => {
        return (
          <Grid item >
            <PostCard key={post.slug} post={post} />
          </Grid>
        )})}
    </Grid>
    </div>
  )
}

