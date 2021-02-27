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
import { GitState, PostData } from "../types";

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
  gitState: GitState,
  syncGitState: (ref?: string, slug?: string) => Promise<void>,
  newContent: string,
  newPostData: PostData,
  editMode: boolean,
  setEditMode: (val: boolean) => void,
}) => {

  const { gitState, syncGitState, editMode, setEditMode, newContent, newPostData } = props;
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const { currentContent, slug } = props.gitState;
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

    if (!post.category) {
      const path = newPostData.path;
      newIndex[key][slug].path = path;

      newIndex[key][slug] = {
        ...newPostData,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
      }

      if (currentContent === newContent && path === post.path) {
        console.warn(`Nothing to update`);
        return;
      }
      if (post.path !== path) {
        data.push({ path: post.path!, content: ""});
      }
      data.push({ path, content: newContent });
    } else {
      // update to new format path = category/slug
      newIndex[key][slug] = {
        ...newIndex[key][slug],
        lastEdit: (new Date()).toLocaleDateString("en-in"),
      };
      if (currentContent === newContent && JSON.stringify(newIndex[key][slug]) === JSON.stringify(post)) {
        console.warn(`Nothing to update`);
        return;
      }
      if (post.path) {
        data.push({ path: post.path, content: "" });
      } else if (post.slug !== slug || post.category !== category) {
        console.log("Path or category changed, deleting old file");
        data.push({ path: `${post.category}/${post.slug}.md`, content: "" });
      }
      data.push({ path: `${category}/${slug}.md`, content: newContent });
    }
    if (currentContent === newContent && JSON.stringify(newIndex) === JSON.stringify(oldIndex) ){
      console.log("no changes detected");
      return;
    }
    data.push({ path: "index.json", content: JSON.stringify(newIndex, null, 2)});
    console.log("Lets push it to git");
    const res = await axios({
      data,
      headers: { "content-type": "application/json" },
      method: "post",
      url: "git/edit",
    });
    if (res && res.status === 200 && res.data) {
      console.log(`git/edit result:`, res);
      setEditMode(false);
      await syncGitState(res.data.commit?.substring(0, 8), slug);
    } else {
      console.error(`Something went wrong`, res);
    }
  }

  const createNew = async (as: string) => {
    // create new index.json entry
    const oldIndex = gitState?.index;
    const newIndex = JSON.parse(JSON.stringify(oldIndex));

    if (as === "draft") {
      if (!newIndex.drafts) newIndex.drafts = {};
      newIndex.drafts[slug] = {
        ...newPostData,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
      };
    } else {
      if (!newIndex.posts) newIndex.posts = {};
      newIndex.posts[slug] = {
        ...newPostData,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        createdOn: (new Date()).toLocaleDateString("en-in"),
      };
    }
    // Send request to update index.json and create new file
    let res = await axios({
      method: "post",
      url: "git/edit",
      data: [
      {
        path: `${newPostData.category}/${newPostData.slug}.md`,
        content: newContent || "Coming Soon",
      },
      {
        path: "index.json",
        content: JSON.stringify(newIndex, null, 2),
      }
    ],
      headers: { "content-type": "application/json" }
    });
    if (res && res.status === 200 && res.data) {
      console.log(`git/edit result:`, res);
      setEditMode(false);
      await syncGitState(res.data.commit?.substring(0, 8), slug);
      handleRedirect(`/${slug}`)
    } else { 
      console.error(`Something went wrong`, res);
    }
  };

  if (!slug || slug === "admin" || readOnly) {
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
  } else if (slug === "" && editMode) {
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
          onClick={() => createNew("draft")}
        />
        <SpeedDialAction
          icon={<Public />}
          tooltipTitle="Publish"
          onClick={() => createNew("post")}
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
