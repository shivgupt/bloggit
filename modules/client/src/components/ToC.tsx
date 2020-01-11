import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { getChildValue } from '../utils';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
} from '@material-ui/core';
import { PostData } from '../types';
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

      <ListItem>
        <Link to={{hash:`#${headingSlug}`}}> {''.repeat(props.level)} {value}
        </Link>
      </ListItem>
    )
  }
  return null;
};

export const Toc = (props: any) => {

  const {posts, content} = props;

  const getPostsByCategories = (posts: PostData[]) => {
    let postsByCategory = {}

    posts.forEach(p => {
      if (postsByCategory[p.category])
        postsByCategory[p.category].push(p);
      else
        postsByCategory[p.category] = [p];
    })

    return postsByCategory;
  }
  let categories;

  useEffect(() => {
    categories = getPostsByCategories(posts);
    console.log(categories);
  }, [posts]);

  return (
              <>
                <TocIcon/>
                <List>
                  <Markdown
                    allowedTypes={['text', 'heading']}
                    source={content}
                    renderers={{ heading: TocGenerator}}
                  />
                </List>
              </>
  )
}
