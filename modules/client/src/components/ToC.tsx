import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { getChildValue } from '../utils';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  IconButton,
  SwipeableDrawer,
} from '@material-ui/core';
import { PostData } from '../types';
import {
  Toc as TocIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBackIos as NavigateBackIcon,
} from '@material-ui/icons';

const TocGenerator = (props: any) => {
  if (props.children.length > 1) {
    console.warn(`This heading has more than one child..?`);
    return null;
  }

  const value = getChildValue(props.children[0]);

  if (value) {
    var headingSlug = value.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\W+/g, '-');

    return (

      <ListItem>
        <Link to={{hash:`#${headingSlug}`}}> {''.repeat(props.level)} {value}
        </Link>
      </ListItem>
    )
  }
  return null;
};

export const Toc = (props: any) => {

  const {
    posts,
    setNode,
    node,
    toggleDrawer
  } = props;

  console.log(posts);
  console.log(node);

  switch(node.current) {
    case 'categories': 
      return (
        <List component="nav" >
          {Object.keys(posts).map((c) => {
            return (
                <ListItem>
                  {c}
                  <IconButton
                    onClick={() => setNode({parent: 'categories', current: 'posts', child: c})}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </ListItem>
            )
          })}
        </List>
      )

    case 'posts': 
      return (
        <>
          <IconButton
            onClick={() => setNode({parent: null, current: 'categories', child: 'posts'})}
          >
            <NavigateBackIcon />
          </IconButton>
          <List component="nav" >
            {posts[node.child].map((p) => {
              return (
                <ListItem key={p.title} component={Link} to={`/post/${p.slug}`}>
                  {p.title}
                  {p.content ? 
                    <IconButton
                      onClick={() => setNode({parent: 'posts', current: 'toc', child: p})}
                    >
                      <TocIcon/>
                    </IconButton>
                    : null
                  }
                </ListItem>
              )
            })}
          </List>
        </>
      )

    case 'toc':
      return (
        <>
          <IconButton
            onClick={() => setNode({parent: 'categories', current: 'posts', child: node.child.category})}
          >
            <NavigateBackIcon />
          </IconButton>
          <List component="nav" >
            <Markdown
              allowedTypes={['text', 'heading']}
              source={node.child.content}
              renderers={{ heading: TocGenerator}}
            />
          </List>
        </>
      );
    default:
      return <div> Hello </div>
  }
}

/*
              <>
                <TocIcon/>
                <List>
                </List>
              </>
 * */
