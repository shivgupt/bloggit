import {
  Button,
  CardMedia,
  IconButton,
  Input,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core";
import {
  Edit,
  Save,
} from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from "axios";
import { Link } from "react-router-dom";
import FastForwardIcon from '@material-ui/icons/FastForward';

import { AdminContext } from "../AdminContext";
import { fetchConfig } from "../utils";

import { Copyable } from "./Copyable";
import { SelectHistorical } from "./SelectHistorical";
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
  const [editMode, setEditMode] = useState(false);
  const [cardBgImg, setCardBgImg] = useState("");
  const [newContent, setNewContent] = useState("Loading Page");
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");
  
  const adminContext = useContext(AdminContext);

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
    () => setNewContent(content),
    [content],
  );

  useEffect(() => {
    if (typeof(post) === "object" && post.img) {
      setCardBgImg(post.img);
    }
  },[post]);

  const save = async () => {
    const newIndex = JSON.parse(JSON.stringify(adminContext.index))
    const data = [] as Array<{path: string, content: string}>;
    if (!post.category) {
      const path = (document.getElementById("post_path") as HTMLInputElement).value;
      console.log(path, post)
      newIndex.posts[slug].path = path;
      if (content === newContent && path === post.path) {
        console.warn(`Nothing to update`);
        return;
      }
      if (post.path !== path) {
        data.push({ path: post.path!, content: ""});
      }
      data.push({ path, content: newContent });
    } else {
      // update to new format path = category/slug
      const slug = (document.getElementById("post_slug") as HTMLInputElement).value;
      const category = (document.getElementById("post_category") as HTMLInputElement).value.toLocaleLowerCase();
      const title = (document.getElementById("post_title") as HTMLInputElement).value;
      const tldr = (document.getElementById("post_tldr") as HTMLInputElement).value;
      const img = (document.getElementById("post_img") as HTMLInputElement).value;
      const tags = (document.getElementById("post_tags") as HTMLInputElement).value.split(",");
      newIndex.posts[slug] = {
        category,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        img,
        tldr,
        title,
        slug,
        tags,
      };
      if (content === newContent && JSON.stringify(newIndex.posts[slug]) === JSON.stringify(post)) {
        console.warn(`Nothing to update`);
        return;
      }
      if (post.path) {
        data.push({ path: post.path, content: "" });
      } else if (post.slug !== slug || post.category !== category) {
        console.log("Path or category changed, deleting old file");
        data.push({ path: `${post.category}/${post.slug}.md`, content: "" });
      }
      data.push({ path: `${category}/${slug}.md`, content: newContent });
    }
    if (content === newContent && JSON.stringify(newIndex) === JSON.stringify(adminContext.index) ){
      console.log("no changes detected");
      return;
    }
    data.push({ path: "index.json", content: JSON.stringify(newIndex, null, 2)});
    console.log("Lets push it to git");
    await axios({
      data,
      headers: { "content-type": "application/json" },
      method: "post",
      url: "git/edit",
    });
    await adminContext.syncRef(undefined, slug);
    setEditMode(false);
  }

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
      <SelectHistorical
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
      {adminContext.adminMode && adminContext.authToken ?
        <>
          <IconButton
            onClick={() => setEditMode(!editMode)}
          >
            <Edit />
          </IconButton>
          <IconButton
            onClick={save}
          >
            <Save />
          </IconButton>
        </>
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
