import React, { useContext, useState } from "react";
import { PostData } from "@blog/types";
import { makeStyles, Fab, Theme, Button } from "@material-ui/core"
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
import { EditPostValidation, SnackAlert } from "../types";
import { defaultSnackAlert, defaultValidation, slugify } from "../utils";

const getPath = (post: PostData) => {
  if (post?.path) return post.path;
  if (post?.category) return `${post.category}/${post.slug}.md`;
  if (post?.slug) return `${post.slug}.md`;

  return `${slugify(post?.title)}.md`;
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
  setValidation: (val: EditPostValidation) => void,
  setSnackAlert: (snackAlert: SnackAlert) => void
}) => {

  const { editMode, setEditMode, newContent, newPostData, setValidation, setSnackAlert } = props;

  const history = useHistory();
  const [open, setOpen] = useState(false);
  //const [snackAlert, setSnackAlert] = useState<SnackAlert>(defaultSnackAlert);
  const classes = useStyles();

  const gitContext = useContext(GitContext);
  const { gitState, syncGitState } = gitContext;
  const { currentContent, slug } = gitState;
  const readOnly = gitState.currentRef !== gitState.latestRef;

  let dialButtonRef;

  const discardConfirm = () => {
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
        });
      }}> Yes </Button>
    });
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

  const handleRedirect = (to: string) => history.push(to)

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
    if (!validate()) {
      setSnackAlert({
        open: true,
        msg: "Please enter post details",
        severity: "error"
      });
      return;
    }
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
      handleRedirect(`/${newPostSlug}`)
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
            setValidation(defaultValidation);
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
          onClick={() => { setEditMode(true); setValidation(defaultValidation)}}
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
        // eslint-disable-next-line
        FabProps={{ref: (ref) => { dialButtonRef = ref }}}
      >
        {slug === ""
          ?  ([<SpeedDialAction
              FabProps={{id: "fab-discard"}}
              icon={<Delete />}
              key="fab-discard"
              onClick={discardConfirm}
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
