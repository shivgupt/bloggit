import {
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
  const { newContent, setNewContent } = adminContext;
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");
  const [cardBgImg, setCardBgImg] = useState("");
  
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

  if (!(adminContext.adminMode && adminContext.authToken)) return <div>Invalid Page</div>
  return (
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        <TextField id="post_title" label="title" defaultValue={"title"} fullWidth />
        <TextField id="post_category" label="category" defaultValue={"category"} />
        <TextField id="post_slug" label="slug" defaultValue={"slug"} />
        <TextField id="post_tldr" label="tldr" defaultValue={"tldr"} multiline fullWidth />
        <TextField id="post_tags" label="tags" defaultValue={"tags"} />
        <Input
          id="post_img"
          value={cardBgImg}
          endAdornment={ <ImageUploader setImageHash={setCardBgImg} /> }
        />
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
        paste={{
          saveImage: save
        }}
      />
    </Paper>
  );
};
