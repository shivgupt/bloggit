import {
  CardMedia,
  Input,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import ReactMde, { SaveImageHandler } from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from "axios";

import { AdminContext } from "../AdminContext";

import { BrowseHistory } from "./BrowseHistory";
import { CodeBlockRenderer } from "./CodeBlock";
import { EmojiRenderer, HeadingRenderer, ImageRenderer, LinkRenderer } from "./Renderers";
import { ImageUploader } from "./ImageUploader";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
  media: {
    [theme.breakpoints.up("md")]: {
      height: 500,
    },
    [theme.breakpoints.down("sm")]: {
      height: 300,
    }
  }
}));

export const PostPage = (props: {
  content: string,
  currentRef: string,
  latestRef: string,
  slug: string,
}) => {
  const { content, currentRef, latestRef, slug } = props;
  const classes = useStyles();

  const [cardBgImg, setCardBgImg] = useState("");
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");

  // MDE command lis
  const save: SaveImageHandler = async function*(data: ArrayBuffer) {

    let res = await axios({
      method: "POST",
      url: "ipfs",
      data: data,
      headers: { "content-type": "multipart/form-data"}
    });
    if (res.status === 200) {
      console.log(res);
      yield res.data;
    } else {
      console.log(res);
    }
    return true;
  };

  const adminContext = useContext(AdminContext);
  const { newContent, setNewContent, editMode } = adminContext;

  const post = (adminContext?.index?.posts?.[slug] || adminContext?.index?.drafts?.[slug]);
 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setNewContent(content), [content]);

  useEffect(() => {
    if (post && post.img) {
      setCardBgImg(post.img);
    }
    const hash = window.location.hash;

    if (hash) {
      const anchor = document.getElementById(hash.substr(1));
      if (anchor) anchor.scrollIntoView();

    }
  },[post]);

  return (
  <>

    <BrowseHistory
      currentRef={currentRef}
      latestRef={latestRef}
      slug={slug}
    />

    <Paper variant="outlined" className={classes.root}>
      {cardBgImg
        ? <CardMedia image={cardBgImg} className={classes.media} />
        : null
      }
      { editMode ? 
        <>
          { !post.category
            ? <div className={classes.root}>
                <TextField id="post_path" label="path" defaultValue={post.path} />
              </div>
            : (
            <div className={classes.root}>
              <TextField id="post_title" label="title" defaultValue={post.title} fullWidth />
              <TextField id="post_category" label="category" defaultValue={post.category} />
              <TextField id="post_slug" label="slug" defaultValue={post.slug} />
              <TextField id="post_tldr" label="tldr" defaultValue={post.tldr} multiline fullWidth />
              <TextField id="post_tags" label="tags" defaultValue={post.tags} />
              <Input
                id="post_img"
                value={cardBgImg}
                endAdornment={ <ImageUploader setImageHash={setCardBgImg} /> }
              />
            </div>)
          }
          <ReactMde
            value={newContent}
            onChange={setNewContent}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            minEditorHeight={400}
            generateMarkdownPreview={(markdown) =>
            Promise.resolve(
              <Markdown
                source={markdown}
                className={classes.text}
                renderers={{
                  heading: HeadingRenderer,
                  code: CodeBlockRenderer,
                  text: EmojiRenderer,
                  link: LinkRenderer,
                  image: ImageRenderer,
                }}
              />
            )}
            paste={{
              saveImage: save
            }}
          />
        </>
        : <Markdown
            source={content || "Loading Page"}
            className={classes.text}
            renderers={{
              heading: HeadingRenderer,
              code: CodeBlockRenderer,
              text: EmojiRenderer,
              link: LinkRenderer,
              image: ImageRenderer,
            }}
          />
      }
    </Paper>
  </>
  );
};
