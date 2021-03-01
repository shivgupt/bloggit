import React, { useContext, useState } from "react";
import { makeStyles, Fab, Theme } from "@material-ui/core"
import {
  SpeedDial,
  SpeedDialAction
} from "@material-ui/lab";
import {
  Add,
  Delete,
  Drafts,
  Edit,
  Public,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import axios from "axios";

import { GitContext } from "../GitContext";
import { GitState, PostData } from "../types";

const getPath = (post: PostData) => {
  if (post?.path) return post.path;
  if (post?.category) return `${post.category}/${post.slug}.md`;
  return `${post.slug}.md`;
};

const useStyles = makeStyles((theme: Theme) => ({
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

export const AppSpeedDial = (props: {
  newContent: string,
  newPostData: PostData,
  editMode: boolean,
  setEditMode: (val: boolean) => void,
}) => {

  const { editMode, setEditMode, newContent, newPostData } = props;

  const history = useHistory();
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const gitContext = useContext(GitContext);
  const { gitState, syncGitState } = gitContext;
  const { currentContent, slug } = gitState;
  const readOnly = gitState.currentRef !== gitState.latestRef;

  let dialButtonRef;

  const handleRedirect = (to: string) => history.push(to)

  const update = async () => {
    const oldIndex = gitState?.index;
    const newIndex = JSON.parse(JSON.stringify(oldIndex))
    const data = [] as Array<{path: string, content: string}>;
    
    let post, key;
    if (oldIndex?.posts?.[slug]) {
      post = oldIndex.posts[slug];
      key = "posts";
    } else {
      post = oldIndex.drafts[slug];
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

    console.log("Lets push it to git");
    const res = await axios({
      data,
      headers: { "content-type": "application/json" },
      method: "post",
      url: "git/edit",
    });
    if (res && res.status === 200 && res.data) {
      setEditMode(false);
      await syncGitState(res.data.commit?.substring(0, 8), slug);
    } else {
      console.error(`Something went wrong`, res);
    }
  }

  const createNew = async (as: "drafts" | "posts") => {
    // create new index.json entry
    const newIndex = JSON.parse(JSON.stringify(gitState?.index));

    const path = getPath(newPostData);

    if (as === "drafts") {
      if (!newIndex.drafts) newIndex.drafts = {};
      newIndex.drafts[newPostData.slug] = {
        ...newPostData,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
      };
    } else {
      if (!newIndex.posts) newIndex.posts = {};
      newIndex.posts[newPostData.slug] = {
        ...newPostData,
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
      await syncGitState(res.data.commit?.substring(0, 8), newPostData.slug);
      handleRedirect(`/${newPostData.slug}`)
    } else { 
      console.error(`Something went wrong`, res);
    }
  };

  if (!editMode && (!slug || slug === "admin" || readOnly)) {
    return (
      <Fab 
        className={classes.speedDial}
        color="primary"
        onClick={() => {
          handleRedirect("/");
          setEditMode(true);
        }}
      > <Add /> </Fab>
    );
  } else if (editMode && slug === "") {
    return (
      <SpeedDial
        ariaLabel="fab"
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        className={classes.speedDial}
        icon={ <Add />}
        FabProps={{ref: (ref) => { dialButtonRef = ref }}}
      >
        <SpeedDialAction
          icon={<Delete />}
          tooltipTitle="Discard changes"
          onClick={() => setEditMode(false)}
        />
        <SpeedDialAction
          icon={<Drafts />}
          tooltipTitle="Save As Draft"
          onClick={() => createNew("drafts")}
        />
        <SpeedDialAction
          icon={<Public />}
          tooltipTitle="Publish"
          onClick={() => createNew("posts")}
        />
      </SpeedDial>
    )
  } else if (!editMode) {
    return (
      <Fab 
      className={classes.speedDial}
      color="primary"
      onClick={() => setEditMode(true)}
      > <Edit /> </Fab>
    );
  } else {
    return (
      <SpeedDial
        ariaLabel="fab"
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        className={classes.speedDial}
        icon={ <Edit />}
        FabProps={{ref: (ref) => { dialButtonRef = ref }}}
      >
        <SpeedDialAction
          icon={<Delete />}
          tooltipTitle="Discard changes"
          onClick={() => setEditMode(false)}
        />
        <SpeedDialAction
          icon={<Drafts />}
          tooltipTitle="Save"
          onClick={update}
        />
      </SpeedDial>
    )
  }
}
