import React from 'react';
import { getChildValue } from '../utils';

export const HeadingRenderer = (props: any) => {
  if (props.children.length > 1) {
    console.warn(`This heading has more than one child..?`);
  }

  const value = getChildValue(props.children[0]);

  if (value) {
  var headingSlug = value.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\W+/g, '-');
  let link = <a href={`#${headingSlug}`} title="Permanent link">¶</a>

  return React.createElement(
    `h${props.level}`,
    {
      'data-sourcepos': props['data-sourcepos'],
      'id': headingSlug
    },
    [props.children, link]
  )
  }
  return null
}
