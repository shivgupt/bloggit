import "react-mde/lib/styles/css/react-mde-all.css";

import { EditRequest, EditResponse, PostData } from "@blog/types";
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
import { getFabStyle } from "../style";
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
  speedDial: getFabStyle(theme),
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

const getPath = (post: PostData | undefined): string | undefined => {
  if (!post) return undefined;
  if (post.path) return post.path;
  if (post.category && post?.slug) return `${post.category}/${post.slug}.md`;
  if (post.slug) return `${post.slug}.md`;
  return undefined;
};

export const EditPost = ({
  setEditMode,
  setSnackAlert,
}: {
  setEditMode: (editMode: boolean) => void;
  setSnackAlert: (snackAlert: SnackAlert) => void;
}) => {
  const [validation, setValidation] = useState<EditPostValidation>(defaultValidation);
  const [editData, setEditData] = useState<EditData>(emptyEdit);
  const [originalEditData, setOriginalEditData] = useState<EditData>(emptyEdit);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [open, setOpen] = useState<boolean>(false);

  const classes = useStyles();
  const history = useHistory();
  const { gitState, syncGitState } = useContext(GitContext);

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
    // Start w/out validation errors
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
      : Object.keys(gitState.index.posts).some(
          s => s !== gitState.slug && s === newEditData.displaySlug
        ) ? "This slug is already in use"
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
    const newSlug = editData.slug || editData.displaySlug;
    const now = (new Date()).toISOString()
    newIndex.posts = newIndex.posts || {};
    const newIndexEntry = {
      slug: newSlug,
      title: editData.title,
      category: editData.category,
      draft: asDraft,
      featured: gitState.indexEntry.featured || false,
      img: editData.img,
      lastEdit: now,
      path: gitState.indexEntry.path,
      tldr: editData.tldr,
    } as PostData;
    newIndex.posts[newSlug] = newIndexEntry;
    if (!asDraft) {
      newIndex.posts[newSlug].publishedOn = newIndexEntry.publishedOn
        ? new Date(newIndexEntry.publishedOn).toISOString()
        : now;
    }
    const newPath = getPath(newIndexEntry);
    const oldPath = getPath(gitState.index.posts[gitState.slug]);
    const editRequest = [
      { path: newPath, content: editData.content, },
      { path: "index.json", content: JSON.stringify(newIndex, null, 2), }
    ] as EditRequest;
    if (oldPath && oldPath !== newPath) {
      editRequest.push({ path: oldPath, content: "" });
    }
    // Send request to update index.json and create new file
    let res = await axios({
      method: "post",
      url: "git/edit",
      data: editRequest,
      headers: { "content-type": "application/json" }
    });
    const editRes = res.data as EditResponse;
    if (res && res.status === 200) {
      if (editRes?.status === "success") {
        await syncGitState(editRes.commit.substring(0, 8), newSlug, true);
        if (gitState.slug !== newSlug) {
          history.push(`/${newSlug}`)
        }
      } else if (editRes?.status === "no change") {
        console.warn(`Edit request yielded no change, still on commit ${editRes.commit}`);
      }
      setEditMode(false);
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
      FabProps={{ id: "fab" }}
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
            onClick={() => saveChanges(false)}
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
            onClick={() => saveChanges(false)}
            tooltipTitle="Save"
          />])
      }
    </SpeedDial>
  </>);
};
