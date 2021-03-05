import "react-mde/lib/styles/css/react-mde-all.css";

import { PostData } from "@blog/types";
import {
  Button,
  Input,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core";
import {
  Add,
  Edit,
  Delete,
  Drafts,
  Public,
} from "@material-ui/icons";
import {
  SpeedDial,
  SpeedDialAction
} from "@material-ui/lab";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import ReactMde, { SaveImageHandler } from "react-mde";
import { useHistory } from "react-router-dom";

import { GitContext } from "../GitContext";
import { SnackAlert } from "../types";
import { emptyEntry, slugify } from "../utils";

import {
  CodeBlockRenderer,
  TextRenderer,
  HeadingRenderer,
  ImageRenderer,
  LinkRenderer
} from "./Renderers";
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

type EditData = PostData & {
  slug: string | null;
  displaySlug: string;
  content: string;
}
const emptyEdit = {
  ...(emptyEntry as any),
  slug: null,
  displaySlug: "",
  content: "",
} as EditData;

type EditPostValidation = {
  hasError: boolean;
  hasChanged: boolean;
  errs: { [entry: string]: string; }
}
const defaultValidation: EditPostValidation = {
  hasError: false,
  hasChanged: false,
  errs: {
    title: "",
    slug: "",
  }
};

const getPath = (post: PostData) => {
  if (post?.path) return post.path;
  if (post?.category) return `${post.category}/${post.slug}.md`;
  if (post?.slug) return `${post.slug}.md`;
  return `${slugify(post?.title)}.md`;
};

export const EditPost = (props: {
  setEditMode: (editMode: boolean) => void;
  setSnackAlert: (snackAlert: SnackAlert) => void;
}) => {
  const { setEditMode, setSnackAlert } = props;

  const classes = useStyles();
  const history = useHistory();
  const { gitState, syncGitState } = useContext(GitContext);

  const [validation, setValidation] = useState<EditPostValidation>(defaultValidation);
  const [editData, setEditData] = useState<EditData>(emptyEdit);
  const [originalEditData, setOriginalEditData] = useState<EditData>(emptyEdit);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [open, setOpen] = useState(false);

  // This should only run once when this component is unmounted
  useEffect(() => {
    // On mount, set initial data to edit
    if (gitState.slug) {
      setOriginalEditData({
        ...gitState.indexEntry,
        content: gitState.currentContent,
        displaySlug: "",
      });
    }
    // Start w/out any validation errors
    setValidation(defaultValidation);
    // On unmount, clear edit data
    return () => {
      setOriginalEditData(emptyEdit);
    };
  }, [gitState]); // gitState will only be updated after turning editMode off

  // This should only run once when the original data is recorded after mounting
  useEffect(() => setEditData(originalEditData), [originalEditData]);

  const syncEditData = (newEditData: EditData) => {
    newEditData.displaySlug = newEditData.slug === null
      ? slugify(newEditData?.title || "")
      : newEditData.slug;
    const titleErr =
      !newEditData.title ? "Title is required"
      : "";
    const slugErr =
      !newEditData.displaySlug ? "Slug is required"
      : newEditData.displaySlug.match(/[^a-z0-9-]/) ? "Slug should only contain a-z, 0-9 and -"
      : "";
    const hasError = !!(slugErr || titleErr);
    const hasChanged = originalEditData.title !== newEditData.title
      || originalEditData.slug !== newEditData.slug
      || originalEditData.category !== newEditData.category
      || originalEditData.tldr !== newEditData.tldr
      || originalEditData.img !== newEditData.img
      || originalEditData.content !== newEditData.content;
    setValidation({ errs: { title: titleErr, slug: slugErr }, hasError, hasChanged });
    setEditData(newEditData);
  }

  const saveImage: SaveImageHandler = async function*(data: ArrayBuffer) {
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

  const update = async () => {
    if (validation.hasError) {
      setSnackAlert({ open: true, msg: "Please enter valid post details", severity: "error" });
      return;
    }
    if (!validation.hasChanged) {
      setSnackAlert({ open: true, msg: "No changes to save", severity: "warning" });
      return;
    }
    const oldIndex = gitState?.index;
    const newIndex = JSON.parse(JSON.stringify(oldIndex))
    newIndex.posts[gitState.slug] = {
      ...oldIndex.posts[gitState.slug],
      slug: editData.slug,
      title: editData.title,
      category: editData.category,
      img: editData.img,
      lastEdit: (new Date()).toLocaleDateString("en-in"),
      tldr: editData.tldr,
    } as PostData;
    const newPath = getPath(editData);
    const oldPath = getPath(oldIndex.posts[gitState.slug]);
    const data = [] as Array<{path: string, content: string}>;
    if (oldPath !== newPath) {
      data.push({ path: oldPath, content: "" });
    }
    data.push({ path: newPath, content: editData.content });
    data.push({ path: "index.json", content: JSON.stringify(newIndex, null, 2)});
    const res = await axios({
      data,
      headers: { "content-type": "application/json" },
      method: "post",
      url: "git/edit",
    });
    if (res && res.status === 200 && res.data) {
      await syncGitState(res.data.commit?.substring(0, 8), gitState.slug, true);
      setEditMode(false);
      // TODO: redirect to new slug if it changed
    } else {
      console.error(`Something went wrong`, res);
    }
  }

  const saveChanges = async (asDraft?: boolean) => {
    if (validation.hasError) {
      setSnackAlert({ open: true, msg: "Please enter valid post details", severity: "error" });
      return;
    }
    if (!validation.hasChanged) {
      setSnackAlert({ open: true, msg: "No changes to publish", severity: "warning" });
      return;
    }
    const newIndex = JSON.parse(JSON.stringify(gitState?.index));
    const path = getPath(editData);
    const newPostSlug = editData.slug || editData.displaySlug;
    const now = (new Date()).toLocaleDateString("en-in");
    const newIndexEntry = {
      ...gitState.indexEntry,
      category: editData.category,
      draft: asDraft,
      img: editData.img,
      lastEdit: now,
      slug: editData.slug,
      title: editData.title,
      tldr: editData.tldr,
    } as PostData;
    newIndex.posts[newPostSlug] = newIndexEntry;
    if (!asDraft) {
      newIndex.posts[newPostSlug].publishedOn = newIndexEntry.publishedOn || now;
    }
    // Send request to update index.json and create new file
    let res = await axios({
      method: "post",
      url: "git/edit",
      data: [
        { path: path, content: editData.content, },
        { path: "index.json", content: JSON.stringify(newIndex, null, 2), }
      ],
      headers: { "content-type": "application/json" }
    });
    if (res && res.status === 200 && res.data) {
      await syncGitState(res.data.commit?.substring(0, 8), newPostSlug, true);
      setEditMode(false);
      history.push(`/${newPostSlug}`)
    } else {
      console.error(`Something went wrong`, res);
    }
  };

  const confirmDiscard = () => {
    if (!validation.hasChanged) {
      setEditMode(false);
    } else {
      setSnackAlert({
        open: true,
        msg: "Do you want to discard all the changes",
        severity: "warning",
        action: <Button onClick={() => {
          setEditMode(false);
          setSnackAlert({
            open: true,
            msg: "Changes discarded",
            severity: "success",
            hideDuration: 6000,
          })
        }}> Yes </Button>
      });
    }
  };

  return (<>
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        {["title", "category", "slug", "tldr"].map(name => {
          let value = editData?.[name] || "";
          if (name === "slug" && editData?.[name] === null) {
            value = editData.displaySlug;
          }
          return (
            <TextField
              autoComplete={"off"}
              error={!!validation.errs[name]}
              fullWidth={["title", "tldr"].includes(name)}
              helperText={validation.errs[name]}
              id={`edit_${name}`}
              key={`edit_${name}`}
              label={name}
              name={name}
              onChange={event => syncEditData({ ...editData, [event.target.name]: event.target.value })}
              required={["title"].includes(name)}
              value={value}
            />
          )
        })}
        <Input
          id="edit_img"
          value={editData?.img || ""}
          endAdornment={ <ImageUploader setImageHash={img => syncEditData({ ...editData, img })} /> }
        />
      </div>
      <ReactMde
        value={editData.content}
        onChange={content => syncEditData({ ...editData, content })}
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
        paste={{ saveImage }}
      />
    </Paper>
    <SpeedDial
      id={"fab"}
      ariaLabel="fab"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      className={classes.speedDial}
      icon={gitState.slug ? <Edit/> : <Add/>}
    >
      {gitState.slug === ""
        ?  ([<SpeedDialAction
            FabProps={{id: "fab-discard"}}
            icon={<Delete />}
            key="fab-discard"
            onClick={confirmDiscard}
            tooltipTitle="Discard changes"
          />,
          <SpeedDialAction
            FabProps={{id: "fab-draft"}}
            icon={<Drafts />}
            key="fab-draft"
            onClick={() => saveChanges(true)}
            tooltipTitle="Save As Draft"
          />,
          <SpeedDialAction
            FabProps={{id: "fab-publish"}}
            icon={<Public />}
            key="fab-publish"
            onClick={() => saveChanges()}
            tooltipTitle="Publish"
          />])
        : ([<SpeedDialAction
            FabProps={{id: "fab-discard"}}
            icon={<Delete />}
            key="fab-discard"
            onClick={confirmDiscard}
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
