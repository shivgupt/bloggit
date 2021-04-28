import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import LinkIcon from "@material-ui/icons/Link";
import React, { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import gfm from "remark-gfm";
import { GitContext } from "../GitContext";
import { getChildValue, replaceEmojiString, slugify } from "../utils";

import { HashLink } from "./HashLink";

const useStyles = makeStyles((theme) => ({
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
    "& > blockquote": {
      padding: `0 ${theme.spacing(2)}px`, 
      borderLeft: `${theme.spacing(0.5)}px solid ${theme.palette.divider}`,
      marginLeft: 0,
    },
    "& p > img": {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    "& p > img + em": {
      display: "block",
      maxWidth: "80%",
      marginTop: theme.spacing(-3),
      marginRight: "auto",
      marginBottom: theme.spacing(4),
      marginLeft: "auto",
    },
  },
}));

export const Markdown = ({
  content,
}: {
  content: string;
}) => {
  const [imgErrors, setImgErrors] = useState({});
  const classes = useStyles();
  const theme = useTheme();

  useEffect(() => {
    console.log(`Got image errors`, imgErrors);
  }, [imgErrors]);

  const ImageRenderer = ({
    node,
  }: {
    node?: any;
  }) => {
    const src = node.properties.src;
    return (!imgErrors[src]
      ? <img
        onError={(e) => {
          if (!imgErrors[src]) {
            setImgErrors(old => ({ ...old, [src]: true }))
          }
        }}
        src={src}
        alt={node.properties.alt}
        style={{ display: "block", margin: "auto", maxWidth: "90%", }}
      />
    : <video
        controls
        src={src}
        style={{ display: "block", margin: "auto", maxWidth: "90%", }}
      />
    )
  };

  const LinkRenderer = ({
    node,
    children,
  }: {
    node: any;
    children: any[];
  }) => {
    return (
      <Link
        color="secondary"
        underline="hover"
        href={node.properties.href}
      >
        {getChildValue(node)}
      </Link>
    );
  };

  const CodeBlockRenderer = ({
    children,
    className,
    inline,
    node,
  }: {
    children: any[];
    className?: string;
    inline?: boolean
    node: any;
  }) => {
    const match = /language-(\w+)/.exec(className || '')
    if (!!inline) {
      return (
        <code className={className}>{getChildValue(node.children[0])}</code>
      );
    } else {
      return (
        <SyntaxHighlighter
          style={theme.palette.type === "dark" ? atomDark : vs}
          language={match ? match[1] : "text"}
          PreTag="div"
          children={String(children).replace(/\n$/, '')}
        />
      )
    }
  };

  const HeadingRenderer = ({
    level,
    node,
  }: {
    level: number;
    node: any;
  }) => {
    const { currentRef, slug } = useContext(GitContext).gitState;
    const value = getChildValue(node);
    if (!value) {
      console.warn(`Heading node has no child value`, node);
      return null;
    }
    const hashlinkSlug = slugify(value)
    const Heading = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return (<>
      <Heading id={hashlinkSlug} style={{ marginTop: "-65px", paddingTop: "65px" }}>
        {value}
        <IconButton
          color="secondary"
          component={HashLink as any}
          edge="start"
          style={{ marginLeft: "2px" }}
          key={hashlinkSlug}
          title="Link to position on page"
          to={`/${currentRef ? `${currentRef}/` : ""}${slug}#${hashlinkSlug}`}
        >
          <LinkIcon />
        </IconButton>
      </Heading>
    </>);
  };

  return (
    <ReactMarkdown
      className={classes.text}
      components={{
        a: LinkRenderer,
        code: CodeBlockRenderer,
        h1: HeadingRenderer,
        h2: HeadingRenderer,
        h3: HeadingRenderer,
        h4: HeadingRenderer,
        h5: HeadingRenderer,
        h6: HeadingRenderer,
        img: ImageRenderer,
      }}
      remarkPlugins={[gfm]}
    >
      {replaceEmojiString(content)}
    </ReactMarkdown>
  );
}
