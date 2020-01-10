import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { getChildValue } from '../utils';
import { Link } from 'react-router-dom';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Paper,
  SwipeableDrawer,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import {
  Toc as TocIcon,
} from '@material-ui/icons';

export const TocGenerator = (props: any) => {
  if (props.children.length > 1) {
    console.warn(`This heading has more than one child..?`);
    return null;
  }

  const value = getChildValue(props.children[0]);

  if (value) {
    var headingSlug = value.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\W+/g, '-');

    return (
      <Link to={{hash:`#${headingSlug}`}}> {' '.repeat(props.level)} {value}
      </Link>
    )
  }
  return null;
}

export const Toc = (props: any) => {
  const [state, setState] = React.useState({open: true });

  const toggleDrawer = (open) => event => {
      if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }

      setState({open});
    };

  return (
    <div>
      <IconButton
        onClick={toggleDrawer(true)}
      >
        <TocIcon/>
      </IconButton>
      <SwipeableDrawer
        anchor="right"
        open={state.open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Markdown
          allowedTypes={['text', 'heading']}
          source={props.source}
          renderers={{ heading: TocGenerator}}
        />
      </SwipeableDrawer>
      <br/>
    </div>
  )
}
