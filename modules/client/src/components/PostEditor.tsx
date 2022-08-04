import "react-mde/lib/styles/css/react-mde-all.css";
import { EditRequest, EditResponse, PostData } from "@bloggit/types";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { makeStyles } from "@mui/material/styles";
import Delete from "@mui/icons-material/Delete";
import Save from "@mui/icons-material/Save";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import Autocomplete from "@mui/material/Autocomplete";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import ReactMde, { SaveImageHandler } from "react-mde";
import { useNavigate } from "react-router-dom";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";
import { SnackAlert } from "../types";
import { emptyEntry, fetchHistory, getExistingCategories, getPath, slugify } from "../utils";

import { Markdown } from "./Markdown";
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
  const navigate = useNavigate();
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
  };

  const saveImage: SaveImageHandler = async function*(data: ArrayBuffer) {
    const res = await axios({
      method: "POST",
      url: "/ipfs",
      data: data,
      headers: { "content-type": "multipart/form-data" }
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
    const now = (new Date()).toISOString();
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
    if (oldSlug && oldSlug !== newSlug) {
      delete newIndex.posts[oldSlug];
    }
    const newPath = getPath(newIndexEntry);
    const editRequest = [
      { path: newPath, content: editData.content },
      { path: "index.json", content: JSON.stringify(newIndex, null, 2) }
    ] as EditRequest;
    const oldPath = getPath(gitState.index.posts[gitState.slug]);
    if (oldPath && oldPath !== newPath) {
      editRequest.push({ path: oldPath, content: "" });
    }
    // Send request to update index.json and create new file
    const res = await axios({
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
          navigate(`/${newSlug}`);
        }
      } else if (editRes?.status === "no change") {
        console.warn(`Edit request yielded no change, still on commit ${editRes.commit}`);
      }
      setSaving(false);
      navigate(`/${newSlug}`);
    } else {
      console.error(`Something went wrong`, res);
    }
  };

  const confirmDiscard = () => {
    if (!validation.hasChanged) {
      navigate(`/${gitState.slug}`);
    } else {
      setSnackAlert({
        open: true,
        msg: "Do you want to discard all the changes",
        severity: "warning",
        action: <Button onClick={() => {
          navigate(`/${gitState.slug}`);
          setSnackAlert({
            open: true,
            msg: "Changes discarded",
            severity: "success",
            hideDuration: 6000,
          });
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
              onChange={
                event => syncEditData({ ...editData, [event.target.name]: event.target.value })
              }
              required={["title"].includes(name)}
              value={value}
            />
          );
        })}
        <Autocomplete
          freeSolo
          options={categories}
          value={editData?.category}
          onChange={(event, value) => {
            syncEditData({ ...editData, category: typeof value === "string" ? value : undefined });
          }}
          renderInput={(params) => (
            <TextField 
              {...params}
              error={!!validation.errs.category}
              helperText={validation.errs["category"]}
              onChange={(event) => {
                syncEditData({ ...editData, category: event.target.value });
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
        generateMarkdownPreview={(content) =>
          Promise.resolve(
            <Markdown content={content} />
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
        FabProps={{ id: "fab-discard" }}
        icon={<Delete />}
        key="fab-discard"
        onClick={confirmDiscard}
        tooltipTitle="Discard changes"
      />,
      <SpeedDialAction
        FabProps={{ id: "fab-save" }}
        icon={<Save />}
        key="fab-save"
        onClick={() => saveChanges()}
        tooltipTitle="Save"
      />
    </SpeedDial>
  </>);
};
