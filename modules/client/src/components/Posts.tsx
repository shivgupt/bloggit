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
  Save,
} from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import emoji from "emoji-dictionary";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";

import { AdminContext } from "../AdminContext";

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

export const PostPage = (props: any) => {

  const { content } = props;
  const classes = useStyles();
  const adminContext = useContext(AdminContext);
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(content);
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");

  useEffect(() => setValue(content), [content]);

  const commitAndPush = () => {
    console.log("Lets push it to git");
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

  console.log(editMode);
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
            onClick={commitAndPush}
          >
            <Save />
          </IconButton>
        </>
        : null
      }
      { editMode ? 
        <ReactMde
          value={value}
          onChange={setValue}
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
            source={content}
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
