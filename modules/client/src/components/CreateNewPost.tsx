import {
  Link,
  Button,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core";
import {
  Save,
  Drafts as DraftIcon,
  Public as PublishIcon,
} from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import emoji from "emoji-dictionary";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";

import { AdminContext } from "../AdminContext";

import { AppSpeedDial } from "./AppSpeedDial";
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
  paper: {
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing(1),
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
}));

export const CreateNewPost = () => {

  const classes = useStyles();
  const adminContext = useContext(AdminContext);
  const { newContent, updateNewContent, adminMode, authToken } = adminContext;
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");
  
  if (!(adminContext.adminMode && adminContext.authToken)) return <div>Invalid Page</div>
  return (
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        <TextField id="post_title" label="title" defaultValue={"title"} fullWidth />
        <TextField id="post_category" label="category" defaultValue={"category"} />
        <TextField id="post_slug" label="slug" defaultValue={"slug"} />
        <TextField id="post_tldr" label="tldr" defaultValue={"tldr"} multiline fullWidth />
        <TextField id="post_img" label="card-img-ipfs#" defaultValue={"img"} />
        <TextField id="post_tags" label="tags" defaultValue={"tags"} />
      </div>
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
      />
      { adminMode && authToken ? <AppSpeedDial /> : null }
    </Paper>
  );
};
