import {
  Link,
  IconButton,
  makeStyles,
  Paper,
  Hidden,
  TextareaAutosize,
} from "@material-ui/core";
import {
  Edit,
  RestaurantRounded,
  Save,
} from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import emoji from "emoji-dictionary";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from "axios";

import { AdminContext } from "../AdminContext";
import { PostData } from "../types";

import { CodeBlockRenderer } from "./CodeBlock";
import { HeadingRenderer } from "./HeadingRenderer";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
}));

export const PostPage = (props: { post?: PostData | string }) => {

  const { post } = props;
  const classes = useStyles();
  const adminContext = useContext(AdminContext);
  const [editMode, setEditMode] = useState(false);
  const [newContent, setNewContent] = useState("Loading Page");
  const [content, setContent] = useState("Loading Page");
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");
  
  useEffect(() => {
    axios.defaults.headers.common["admin-token"] = adminContext.authToken;
  }, [adminContext]);

  useEffect(() => {
    if (typeof(post) === "string") {
      setContent(post);
      setNewContent(post);
    } else if (post && post.content) {
      setContent(post.content);
      setNewContent(post.content);
    }
  },[post]);

  const updateGit = async () => {
    if (content === newContent){
      console.log("no changes detected");
      return;
    }
    console.log("Lets push it to git");
    let path: string;
    if (typeof(post) === "string") {
      path = post;
    } else if (post && post.path) {
      path = post.path;
    } else {
      console.log("error: no path found");
      return;
    }
    let res = await axios({
      method: "post",
      url: `git/push/${path}`,
      data: newContent,
      headers: { "content-type": "text/plain" }
    });
    console.log(res.status);
    console.log(res);
    setEditMode(false);
  }

  const emojiSupport = text =>
    text.value.replace(/:\w+:/gi, name =>
      emoji.getUnicode(name) || name);

  const Image = (props: any) => {
    return <img
      { ...props }
      src={props.src}
      alt={props.alt}
      style={{ maxWidth: "100%", height: "200px", width: "200px" }}
    />;
  };

  const LinkRenderer = (props: any) => {
    return (<Link color="secondary" href={props.href}> {props.children[0].props.value} </Link>);
  };

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
            onClick={updateGit}
          >
            <Save />
          </IconButton>
        </>
        : null
      }
      { editMode ? 
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
                text: emojiSupport,
                link: LinkRenderer,
                image: Image,
              }}
            />
          )}
        />
        : <Markdown
            source={content || "Loading Page"}
            className={classes.text}
            renderers={{
              heading: HeadingRenderer,
              code: CodeBlockRenderer,
              text: emojiSupport,
              link: LinkRenderer,
              image: Image,
            }}
          />
      }
    </Paper>
  );
};