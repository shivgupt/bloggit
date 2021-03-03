import { useTheme } from "@material-ui/core/styles";
import { IconButton, Link } from "@material-ui/core";
import { Link as LinkIcon } from "@material-ui/icons";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

import { getChildValue, replaceEmojiString, slugify } from "../utils";

import { HashLink } from "./HashLink";

export const CodeBlockRenderer = (props: any) => {
  const theme = useTheme();

  if (theme.palette.type === "dark") {
    return (
      <SyntaxHighlighter showLineNumbers language={props.language} style={atomDark}>
        {props.value}
      </SyntaxHighlighter>
    );
  }

  return (
    <SyntaxHighlighter showLineNumbers language={props.language} style={vs}>
      {props.value}
    </SyntaxHighlighter>
  );
};

export const TextRenderer = (props: any) => {
  return <> {replaceEmojiString(props.value)} </>
}

export  const LinkRenderer = (props: any) => {
  return (<Link color="secondary" underline="hover" href={props.href}> {props.children[0].props.value} </Link>);
};

export  const ImageRenderer = (props: any) => {
    return <img
      { ...props }
      src={props.src}
      alt={props.alt}
      style={{
        maxWidth: "90%",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
      }}
    />;
  };

export const HeadingRenderer = (props: any) => {
  if (props.children.length > 1) {
    console.warn("This heading has more than one child..?");
  }

  const value = getChildValue(props.children[0]);

  if (!value) {
    return null;
  }

  const slug = slugify(value)

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
