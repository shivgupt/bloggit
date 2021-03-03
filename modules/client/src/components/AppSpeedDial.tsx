import React, { useContext, useState } from "react";
import { PostData } from "@blog/types";
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
      await syncGitState(res.data.commit?.substring(0, 8), newPostData.slug, true);
      handleRedirect(`/${newPostData.slug}`)
    } else {
      console.error(`Something went wrong`, res);
    }
  };

  if (!editMode) {
    if (!slug || slug === "admin" || readOnly) {
      return (
        <Fab
          id={"fab"}
          className={classes.speedDial}
          color="primary"
          onClick={() => {
            setEditMode(true);
            handleRedirect("/");
          }}
        ><Add/></Fab>
      );
    } else {
      return (
        <Fab
          id={"fab"}
          className={classes.speedDial}
          color="primary"
          onClick={() => setEditMode(true)}
        ><Edit/></Fab>
      );
    }
  } else {
    return (
      <SpeedDial
        id={"fab"}
        ariaLabel="fab"
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        className={classes.speedDial}
        icon={<Add/>}
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
    )
  }
}
