import { PostData } from "@blog/types";
import {
  Input,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core";
import {
  SpeedDial,
  SpeedDialAction
} from "@material-ui/lab";
import {
  Add,
  Edit,
  Delete,
  Drafts,
  Public,
} from "@material-ui/icons";
import React, { useContext, useState } from "react";
import Markdown from "react-markdown";
import ReactMde, { SaveImageHandler } from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import axios from "axios";
import { useHistory } from "react-router-dom";

import { GitContext } from "../GitContext";
import { EditPostValidation } from "../types";

import {
  CodeBlockRenderer,
  TextRenderer,
  HeadingRenderer,
  ImageRenderer,
  LinkRenderer
} from "./Renderers";
import { ImageUploader } from "./ImageUploader";
import { defaultValidation, slugify } from "../utils";

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
  speedDial: {
    position: "fixed",
    bottom: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      right: "23%",
    },
    [theme.breakpoints.down("sm")]: {
      right: theme.spacing(2),
    },
  },
}));

const getPath = (post: PostData) => {
  if (post?.path) return post.path;
  if (post?.category) return `${post.category}/${post.slug}.md`;
  if (post?.slug) return `${post.slug}.md`;
  return `${slugify(post?.title)}.md`;
};

export const EditPost = (props: {
  postData: PostData;
  content: string;
  setPostData: any;
  setContent: any;
  newContent: string;
  newPostData: PostData;
  validation: EditPostValidation;
  setValidation: any;
  setEditMode: any;
}) => {
  const {
    postData, newPostData, newContent, content, setPostData,
    setContent, validation, setValidation, setEditMode,
  } = props;

  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const gitContext = useContext(GitContext);
  const { gitState, syncGitState } = gitContext;
  const { currentContent, slug } = gitState;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostData({
      ...postData,
      [e.target.name]: e.target.value
    });
  }

  const handleImageUpload = (value: string) => {
    setPostData({
      ...postData,
      img: value,
    });
  };

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

  const validate = (): boolean => {
    const invalidSlug = /[^a-z0-9-]/;
    const newValidation = JSON.parse(JSON.stringify(defaultValidation));
    console.log(newPostData)
    let valid = true;
    // Validate Post Title
    if (newPostData.title === "") {
      newValidation.title = { err: true, msg: "Required" };
      valid = false;
    }
    // Validate Post Slug
    if (newPostData.slug.toLowerCase().match(invalidSlug)?.length) {
      newValidation.slug = { err: true, msg: "Slug should only contain a-z, 0-9 and -" };
      valid = false;
    }
    setValidation(newValidation);
    return valid;
  };

  const update = async () => {
    if (!validate()) return;
    const oldIndex = gitState?.index;
    const newIndex = JSON.parse(JSON.stringify(oldIndex))
    const data = [] as Array<{path: string, content: string}>;
    let key;
    if (oldIndex?.posts?.[slug]) {
      key = "posts";
    } else {
      key = "drafts";
    }
    const newPath = getPath(newPostData);
    const oldPath = getPath(oldIndex[key][slug]);
    newIndex[key][slug] = {
      ...newPostData,
      lastEdit: (new Date()).toLocaleDateString("en-in"),
    };
    if (currentContent === newContent
      && JSON.stringify(newIndex[key][slug]) === JSON.stringify(oldIndex[key][slug])
    ) {
      console.warn(`Nothing to update`);
      return;
    }
    if (oldPath !== newPath) {
      data.push({ path: oldPath, content: "" });
    }
    data.push({ path: newPath, content: newContent });
    data.push({ path: "index.json", content: JSON.stringify(newIndex, null, 2)});
    const res = await axios({
      data,
      headers: { "content-type": "application/json" },
      method: "post",
      url: "git/edit",
    });
    if (res && res.status === 200 && res.data) {
      setEditMode(false);
      await syncGitState(res.data.commit?.substring(0, 8), slug, true);
    } else {
      console.error(`Something went wrong`, res);
    }
  }

  const createNew = async (as: "drafts" | "posts") => {
    // create new index.json entry
    if (!validate()) return;
    const newIndex = JSON.parse(JSON.stringify(gitState?.index));
    const path = getPath(newPostData);
    const newPostSlug = newPostData.slug || slugify(newPostData.title);
    if (as === "drafts") {
      if (!newIndex.drafts) newIndex.drafts = {};
      newIndex.drafts[newPostSlug] = {
        ...newPostData,
        slug: newPostSlug,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
      };
    } else {
      if (!newIndex.posts) newIndex.posts = {};
      newIndex.posts[newPostSlug] = {
        ...newPostData,
        slug: newPostSlug,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        publishedOn: (new Date()).toLocaleDateString("en-in"),
      };
    }
    // Send request to update index.json and create new file
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
    if (res && res.status === 200 && res.data) {
      setEditMode(false);
      await syncGitState(res.data.commit?.substring(0, 8), newPostSlug, true);
      history.push(`/${newPostSlug}`)
    } else {
      console.error(`Something went wrong`, res);
    }
  };

  let dialButtonRef;

  const fullWidth = ["title", "tldr"];
  const required = ["title"];
  return (<>
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        {["title", "category", "slug", "tldr"].map(name => {
          let value = postData?.[name] || "";
          if (name === "slug" && postData?.[name] === null) {
            value = slugify(postData?.title || "");
          }
          return (
            <TextField
              key={`post_${name}`}
              error={validation[name].err}
              helperText={validation[name].msg}
              id={`post_${name}`}
              label={name}
              name={name}
              value={value}
              required={required.includes(name)}
              fullWidth={fullWidth.includes(name)}
              onChange={handleChange}
            />
          )
        })}
        <Input
          id="post_img"
          value={postData?.img || ""}
          endAdornment={ <ImageUploader setImageHash={handleImageUpload} /> }
        />
      </div>
      <ReactMde
        value={content}
        onChange={setContent}
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
                text: TextRenderer,
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
    <SpeedDial
      id={"fab"}
      ariaLabel="fab"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      className={classes.speedDial}
      icon={slug ? <Edit/> : <Add/>}
      // eslint-disable-next-line
      FabProps={{ref: (ref) => { dialButtonRef = ref }}}
    >
      {slug === ""
        ?  ([<SpeedDialAction
            FabProps={{id: "fab-discard"}}
            icon={<Delete />}
            key="fab-discard"
            onClick={() => setEditMode(false)}
            tooltipTitle="Discard changes"
          />,
          <SpeedDialAction
            FabProps={{id: "fab-draft"}}
            icon={<Drafts />}
            key="fab-draft"
            onClick={() => createNew("drafts")}
            tooltipTitle="Save As Draft"
          />,
          <SpeedDialAction
            FabProps={{id: "fab-publish"}}
            icon={<Public />}
            key="fab-publish"
            onClick={() => createNew("posts")}
            tooltipTitle="Publish"
          />])
        : ([<SpeedDialAction
            FabProps={{id: "fab-discard"}}
            icon={<Delete />}
            key="fab-discard"
            onClick={() => setEditMode(false)}
            tooltipTitle="Discard changes"
          />,
          <SpeedDialAction
            FabProps={{id: "fab-save"}}
            icon={<Drafts />}
            key="fab-save"
            onClick={update}
            tooltipTitle="Save"
          />])
      }
    </SpeedDial>
  </>);
};
