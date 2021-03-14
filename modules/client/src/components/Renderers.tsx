import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import { useTheme } from "@material-ui/core/styles";
import LinkIcon from "@material-ui/icons/Link";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

import { getChildValue, replaceEmojiString, slugify } from "../utils";

import { HashLink } from "./HashLink";

export const CodeBlockRenderer = ({
  language,
  value,
}: {
  language: string;
  value: string;
}) => {
  const theme = useTheme();
  if (theme.palette.type === "dark") {
    return (
      <SyntaxHighlighter showLineNumbers language={language} style={atomDark}>
        {value}
      </SyntaxHighlighter>
    );
  }
  return (
    <SyntaxHighlighter showLineNumbers language={language} style={vs}>
      {value}
    </SyntaxHighlighter>
  );
};

export const TextRenderer = ({
  value,
}: {
  value: string;
}) => {
  return <> {replaceEmojiString(value)} </>
}

export const LinkRenderer = ({
  href,
  children,
}: {
  href: string;
  children: any[];
}) => {
  return (<Link color="secondary" underline="hover" href={href}> {children[0].props.value} </Link>);
};

export const ImageRenderer = ({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style?: object;
}) => {
    return <img
      src={src}
      alt={alt}
      style={style || {
        display: "block",
        margin: "auto",
        maxWidth: "90%",
      }}
    />;
  };

export const HeadingRenderer = ({
  children,
  level,
  data,
  "data-sourcepos": dataSourcepos,
}: {
  children: any[];
  level: string;
  data: string;
  "data-sourcepos": string;
}) => {
  if (children.length > 1) {
    console.warn("This heading has more than one child..?");
  }
  const value = getChildValue(children[0]);
  if (!value) return null;
  const slug = slugify(value)
  return React.createElement(
    `h${level}`,
    {
      "data-sourcepos": dataSourcepos,
      "id": slug,
      style: {
        marginTop: "-65px",
        paddingTop: "65px"
      }
    },
    [
      children, 
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
