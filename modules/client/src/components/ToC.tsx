import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { getChildValue } from '../utils';
import { Link } from 'react-router-dom';
import { ListItem } from '@material-ui/core';

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
}
