import React from 'react';

export const HeadingRenderer = (props: any) => {
  if (props.children.length > 1) {
    console.warn(`This heading has more than one child..?`);
  }
  const child = props.children[0];
  console.log(child.$$typeof, child);
  console.log(props);
  var headingSlug = child.props.value.toLowerCase().replace(/\W/g, '-');
  let link = <a href={`#${headingSlug}`} title="Permanent link">¶</a>

  return React.createElement(
    `h${props.level}`,
    {
      'data-sourcepos': props['data-sourcepos'],
      'id': headingSlug
    },
    [link,props.children]
  )
}
