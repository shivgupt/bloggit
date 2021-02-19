import {
  IconButton,
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

import { AdminContext } from "../AdminContext";

import { CodeBlockRenderer } from "./CodeBlock";
import { EmojiRenderer, HeadingRenderer, ImageRenderer, LinkRenderer } from "./Renderers";

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
}));

export const PostPage = (props: { content: string, slug?: string }) => {

  const { content, slug } = props;
  const classes = useStyles();
  const [editMode, setEditMode] = useState(false);
  const [newContent, setNewContent] = useState("Loading Page");
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");
  
  const adminContext = useContext(AdminContext);
  const post = slug ? adminContext.index.posts[slug] : "about";

  useEffect(() => {
    axios.defaults.headers.common["admin-token"] = adminContext.authToken;
  }, [adminContext]);

  useEffect(() => setNewContent(content),[content]);

  const save = async () => {
    const newIndex = JSON.parse(JSON.stringify(adminContext.index))
    const path = (document.getElementById("post_path") as HTMLInputElement).value;
    if (typeof(post) === "string") {
      newIndex.about = path;
    } else if (path) {

      const slug = (document.getElementById("post_slug") as HTMLInputElement).value;
      const category = (document.getElementById("post_category") as HTMLInputElement).value;
      const title = (document.getElementById("post_title") as HTMLInputElement).value;
      const tldr = (document.getElementById("post_tldr") as HTMLInputElement).value;
      const tags = (document.getElementById("post_tags") as HTMLInputElement).value.split(",");

      newIndex.posts[slug] = {
        category,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        path,
        tldr,
        title,
        slug,
        tags,
      };

    } else {
      console.log("error: no path found");
      return;
    }

    if (content === newContent && JSON.stringify(newIndex) === JSON.stringify(adminContext.index) ){
      console.log("no changes detected");
      return;
    }
    console.log("Lets push it to git");

    let res = await axios({
      method: "post",
      url: "git/edit",
      data: [
      {
        path: path,
        content: newContent,
      },
      {
        path: "index.json",
        content: JSON.stringify(newIndex, null, 2),
      }
    ],
      headers: { "content-type": "application/json" }
    });

    if (typeof(post) === "string") {
      adminContext.updateIndex(JSON.parse(JSON.stringify(adminContext.index)), "about");
    } else {
      adminContext.updateIndex(
        JSON.parse(JSON.stringify(adminContext.index)),
        "content",
        "posts",
        post.slug
      )
    }
    setEditMode(false);
  }

  return (
    <Paper variant="outlined">
      {adminContext.adminMode ?
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
          { typeof(post) === "string"
            ? <div className={classes.root}>
                <TextField id="post_path" label="path" defaultValue={adminContext.index.about} />
              </div>
            : (
            <div className={classes.root}>
              <TextField id="post_title" label="title" defaultValue={post?.title} fullWidth />
              <TextField id="post_path" label="path" defaultValue={post?.path} fullWidth />
              <TextField id="post_slug" label="slug" defaultValue={post?.slug} />
              <TextField id="post_category" label="category" defaultValue={post?.category} />
              <TextField id="post_tldr" label="tldr" defaultValue={post?.tldr} multiline fullWidth />
              <TextField id="post_img" label="card-img-ipfs#" defaultValue={post?.img} />
              <TextField id="post_tags" label="tags" defaultValue={post?.tags} />
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
  );
};
