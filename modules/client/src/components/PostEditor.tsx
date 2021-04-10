import "react-mde/lib/styles/css/react-mde-all.css";
import { EditRequest, EditResponse, PostData } from "@blog/types";
import Backdrop from "@material-ui/core/Backdrop";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Delete from "@material-ui/icons/Delete";
import Save from "@material-ui/icons/Save";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import Autocomplete from '@material-ui/lab/Autocomplete';
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import ReactMde, { SaveImageHandler } from "react-mde";
import { useHistory } from "react-router-dom";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";
import { SnackAlert } from "../types";
import { emptyEntry, fetchHistory, getExistingCategories, getPath, slugify } from "../utils";

import {
  CodeBlockRenderer,
  TextRenderer,
  HeadingRenderer,
  ImageRenderer,
  LinkRenderer
} from "./Renderers";
import { ImageInput } from "./ImageInput";

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
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
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

export const PostEditor = ({
  setSnackAlert,
}: {
  setSnackAlert: (snackAlert: SnackAlert) => void;
}) => {
  const [validation, setValidation] = useState<EditPostValidation>(defaultValidation);
  const [editData, setEditData] = useState<EditData>(emptyEdit);
  const [originalEditData, setOriginalEditData] = useState<EditData>(emptyEdit);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [open, setOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

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
  }, [gitState]); // gitState will only be updated after editing is finished

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
      || !!originalEditData.draft !== !!newEditData.draft
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
      url: "/ipfs",
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

  const saveChanges = async () => {
    if (validation.hasError) {
      setSnackAlert({ open: true, msg: "Please enter valid post details", severity: "error" });
      return;
    }
    if (!validation.hasChanged) {
      setSnackAlert({ open: true, msg: "No changes to publish", severity: "warning" });
      return;
    }
    setSaving(true);
    const newIndex = JSON.parse(JSON.stringify(gitState?.index));
    const oldSlug = originalEditData.slug;
    const newSlug = editData.slug || editData.displaySlug;
    const now = (new Date()).toISOString()
    newIndex.posts = newIndex.posts || {};
    const newIndexEntry = {
      slug: newSlug,
      title: editData.title,
      category: editData.category,
      draft: !!editData.draft,
      featured: editData?.featured || false,
      img: editData.img,
      path: editData?.path || undefined,
      publishedOn: editData?.publishedOn || (!editData.draft ? now : undefined),
      tldr: editData.tldr,
    } as PostData;
    newIndex.posts[newSlug] = newIndexEntry;
    const newPath = getPath(newIndexEntry);
    const oldPath = getPath(gitState.index.posts[gitState.slug]);
    const editRequest = [
      { path: newPath, content: editData.content, },
      { path: "index.json", content: JSON.stringify(newIndex, null, 2), }
    ] as EditRequest;
    if (oldPath && oldPath !== newPath) {
      editRequest.push({ path: oldPath, content: "" });
    }
    if (oldSlug && oldSlug !== newSlug) {
      delete newIndex.posts[oldSlug]
    }
    // Send request to update index.json and create new file
    let res = await axios({
      method: "post",
      url: "/git/edit",
      data: editRequest,
      headers: { "content-type": "application/json" }
    });
    const editRes = res.data as EditResponse;
    if (res && res.status === 200) {
      if (editRes?.status === "success") {
        await syncGitState(editRes.commit.substring(0, 8), newSlug, true);
        await fetchHistory(newSlug, true);
        if (gitState.slug !== newSlug) {
          history.push(`/${newSlug}`)
        }
      } else if (editRes?.status === "no change") {
        console.warn(`Edit request yielded no change, still on commit ${editRes.commit}`);
      }
      setSaving(false);
      history.push(`/${newSlug}`);
    } else {
      console.error(`Something went wrong`, res);
    }
  };

  const confirmDiscard = () => {
    if (!validation.hasChanged) {
      history.push(`/${gitState.slug}`);
    } else {
      setSnackAlert({
        open: true,
        msg: "Do you want to discard all the changes",
        severity: "warning",
        action: <Button onClick={() => {
          history.push(`/${gitState.slug}`);
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

  const categories = getExistingCategories(gitState.index.posts);
  return (<>
    <Paper variant="outlined" className={classes.paper}>
      <div className={classes.root}>
        {["title", "slug", "tldr"].map(name => {
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
              id={`edit-${name}`}
              key={`edit-${name}`}
              label={name}
              name={name}
              onChange={event => syncEditData({ ...editData, [event.target.name]: event.target.value })}
              required={["title"].includes(name)}
              value={value}
            />
          )
        })}
        <Autocomplete
          freeSolo
          options={categories}
          value={editData?.category}
          onChange={(event, value) => {
            syncEditData({ ...editData, category: typeof value === "string" ? value : undefined })
          }}
          renderInput={(params) => (
            <TextField 
              {...params}
              error={!!validation.errs.category}
              helperText={validation.errs["category"]}
              onChange={(event) => {
                syncEditData({ ...editData, category: event.target.value })
              }}
              id={"edit-category"}
              label="category"
              name="category"
            />
          )}
        />
        <ImageInput
          imageUrl={editData.img || ""}
          setImageUrl={img => syncEditData({ ...editData, img })} 
        />
        <FormControlLabel
          label="Draft"
          labelPlacement="top"
          control={
            <Switch
              id="toggle-draft"
              checked={!!editData.draft}
              inputProps={{ name: "Draft" }}
              onChange={() => syncEditData({ ...editData, draft: !editData?.draft })}
            />
          }
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
    <Backdrop className={classes.backdrop} open={saving}>
      <CircularProgress color="inherit" />
    </Backdrop>
    <SpeedDial
      FabProps={{ id: "fab" }}
      ariaLabel="fab"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      className={classes.speedDial}
      icon={<ArrowDropUp fontSize="large" />}
    >
      <SpeedDialAction
        FabProps={{id: "fab-discard"}}
        icon={<Delete />}
        key="fab-discard"
        onClick={confirmDiscard}
        tooltipTitle="Discard changes"
      />,
      <SpeedDialAction
        FabProps={{id: "fab-save"}}
        icon={<Save />}
        key="fab-save"
        onClick={() => saveChanges()}
        tooltipTitle="Save"
      />
    </SpeedDial>
  </>);
};
