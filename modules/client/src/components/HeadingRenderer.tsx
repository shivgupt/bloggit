import { IconButton } from "@material-ui/core";
import { Link as LinkIcon } from "@material-ui/icons";
import React from "react";

import { getChildValue } from "../utils";

import { HashLink } from "./HashLink";

export const HeadingRenderer = (props: any) => {
  if (props.children.length > 1) {
    console.warn("This heading has more than one child..?");
  }

  const value = getChildValue(props.children[0]);

  if (!value) {
    return null;
  }

  const slug = value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\W+/g, "-");

  return React.createElement(
    `h${props.level}`,
    {
      "data-sourcepos": props["data-sourcepos"],
      "id": slug,
      style: {
        marginTop: "-65px",
        paddingTop: "65px"
      }
    },
    [
      props.children, 
      <IconButton
        color="inherit"
        component={HashLink as any}
        edge="start"
        key={slug}
        title="Link to position on page"
        to={`#${slug}`}
      >
        <LinkIcon />
      </IconButton>
    ]
  );
};
