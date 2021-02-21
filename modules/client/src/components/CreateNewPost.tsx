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
  const [newContent, setNewContent] = useState("");
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");
  
  const save = async (as: string) => {
    // create new index.json entry
    const newIndex = JSON.parse(JSON.stringify(adminContext.index))

    const slug = (document.getElementById("post_slug") as HTMLInputElement).value;
    const category = (document.getElementById("post_category") as HTMLInputElement).value.toLocaleLowerCase();
    const title = (document.getElementById("post_title") as HTMLInputElement).value;
    const tldr = (document.getElementById("post_tldr") as HTMLInputElement).value;
    const img = (document.getElementById("post_img") as HTMLInputElement).value;
    const tags = (document.getElementById("post_tags") as HTMLInputElement).value.split(",");

    if (as === "draft") {
      if (!newIndex.drafts) newIndex.drafts = {};
      newIndex.drafts[slug] = {
        category,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        tldr,
        title,
        img,
        slug,
        tags,
      };
    } else {
      if (!newIndex.posts) newIndex.posts = {};
      newIndex.posts[slug] = {
        category,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        tldr,
        title,
        img,
        slug,
        tags,
      };
    }

    // Send request to update index.json and create new file
    let res = await axios({
      method: "post",
      url: "git/edit",
      data: [
      {
        path: `${category}/${slug}.md`,
        content: newContent || "Coming Soon",
      },
      {
        path: "index.json",
        content: JSON.stringify(newIndex, null, 2),
      }
    ],
      headers: { "content-type": "application/json" }
    });
    
    if (res.status === 200) {
      adminContext.updateIndex(undefined, "index");
    } else { 
      console.log("Something went wrong")
    }
  };

  if (!(adminContext.adminMode && adminContext.authToken)) return <div>Invalid Page</div>
  return (
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        <TextField id="post_title" label="title" defaultValue={"post-title"} fullWidth />
        <TextField id="post_category" label="category" defaultValue={"post-category"} />
        <TextField id="post_slug" label="slug" defaultValue={"post-slug"} />
        <TextField id="post_tldr" label="tldr" defaultValue={"post-tldr"} multiline fullWidth />
        <TextField id="post_img" label="card-img-ipfs#" defaultValue={"post-img"} />
        <TextField id="post_tags" label="tags" defaultValue={"post-tags"} />
      </div>
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
      <Button
        onClick={() => save("draft")}
        startIcon={<DraftIcon />}
        variant="contained"
        color="secondary"
        className={classes.button}
        size="small"
      >
        Save Draft
      </Button>
      <Button
        onClick={() => save("post")}
        startIcon={<PublishIcon />}
        variant="contained"
        color="secondary"
        className={classes.button}
        size="small"
      >
        Publish
      </Button>
    </Paper>
  );
};
