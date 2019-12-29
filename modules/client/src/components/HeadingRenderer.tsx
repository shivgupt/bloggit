import React from 'react';

export const HeadingRenderer = (props: any) => {
  if (props.children.length > 1) {
    console.warn(`This heading has more than one child..?`);
  }
  const child = props.children[0];
  console.log(child.$$typeof, child);
  return <h3 title="test">{props.children}</h3>;
}
