import {
  Button,
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
import { Link } from "react-router-dom";
import FastForwardIcon from '@material-ui/icons/FastForward';

import { AdminContext } from "../AdminContext";
import { fetchConfig } from "../utils";
import axios from "axios";

import { Copyable } from "./Copyable";
import { EditHistory } from "./EditHistory";
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
  buttonBar: {
    display: "flex",
  },
  button: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(-1),
    marginLeft: theme.spacing(1),
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

export const PostPage = (props: { content: string, slug: string, gitRef: string }) => {

  const { content, gitRef: ref, slug } = props;
  const classes = useStyles();
  const [isHistorical, setIsHistorical] = useState(false);
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
  const { newContent, updateNewContent, editMode, setEditMode } = adminContext;

  const post = (adminContext.index.posts[slug] || adminContext.index.drafts[slug]);

  useEffect(() => {
    (async () => {
      const latestRef = (await fetchConfig(true)).commit.substring(0, 8);
      if (latestRef !== ref) {
        console.log(`latestRef ${latestRef} !== current ref ${ref}`);
        setIsHistorical(true);
      } else {
        console.log(`We're on the latest version`);
        setIsHistorical(false);
      }
    })();
  }, [ref, slug]);

  useEffect(
    () => updateNewContent(content),
    [content],
  );

  useEffect(() => {
    if (typeof(post) === "object" && post.img) {
      setCardBgImg(post.img);
    }
  },[post]);

  // TODO: handle loading better
  if (!post) return <> Loading </>
  return (
  <>

    <div className={classes.buttonBar}>
      <Copyable
        className={classes.button}
        color={"primary"}
        text={"Permalink"}
        tooltip={"Snapshot of this page that will never change or disappear"}
        value={`${window.location.origin}/${ref}/${slug}`}
      />
      <EditHistory
        className={classes.button}
        slug={slug}
        gitRef={ref}
      />
      {isHistorical
        ? <Button
            className={classes.button}
            startIcon={<FastForwardIcon/>}
            component={Link}
            color={"primary"}
            variant={"contained"}
            to={`/${slug}`}
          >Jump To Present</Button>
        : null}
    </div>

    <Paper variant="outlined" className={classes.root}>
      {post.img
        ? <CardMedia image={post.img} className={classes.media} />
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
            onChange={updateNewContent}
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
