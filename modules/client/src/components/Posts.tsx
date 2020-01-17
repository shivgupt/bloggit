import {
  createStyles,
  makeStyles,
  Paper,
  Theme,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Markdown from "react-markdown";

import { CodeBlockRenderer } from "./CodeBlock";
import { HeadingRenderer } from "./HeadingRenderer";
import { emptyPost, fetchContent } from "../utils";
import { PostData } from "../types";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
}));

export const PostPage = (props: any) => {
  const classes = useStyles();
  const [content, setContent] = useState("Loading");
  const [postData, setPostData] = useState(emptyPost as PostData);
  const { index, setTitle, slug, title } = props;

  // Set post content & data if slug or index changes
  useEffect(() => {
    (async () => {
      setContent(await fetchContent(slug));
      setPostData(index.posts.find(post => post.slug === slug) || emptyPost);
    })();
  }, [index, slug]);

  // Set title when post data changes
  useEffect(() => {
    setTitle({ ...title, secondary: postData.title });
  // eslint-disable-next-line
  }, [postData]);

  return (
    <Paper variant="outlined">
      <Markdown
        source={content}
        className={classes.text}
        renderers={{ heading: HeadingRenderer, code: CodeBlockRenderer }}
      />
    </Paper>
  );
};
