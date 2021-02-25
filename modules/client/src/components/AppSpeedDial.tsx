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
import { useHistory, useRouteMatch } from "react-router-dom";
import axios from "axios";

import { AdminContext } from "../AdminContext";

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

export const AppSpeedDial = (props: any) => {

  const { content } = props;
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const adminContext = useContext(AdminContext);
  const { newContent, editMode, setEditMode } = adminContext;

  const slugMatch = useRouteMatch("/:slug");
  const slugParam = slugMatch ? slugMatch.params.slug : "";

  let dialButtonRef;

  const handleRedirect = (to: string) => history.push(to)

  const update = async () => {
    const newIndex = JSON.parse(JSON.stringify(adminContext.index))
    const data = [] as Array<{path: string, content: string}>;

    let post, key;
    if (adminContext.index.posts[slugParam]) {
      post = adminContext.index.posts[slugParam];
      key = "posts";
    } else {
      post = adminContext.index.drafts[slugParam];
      key = "drafts";
    }

    if (!post.category) {
      const path = (document.getElementById("post_path") as HTMLInputElement).value;
      newIndex.posts[slugParam].path = path;
      if (content === newContent && path === post.path) {
        console.warn(`Nothing to update`);
        return;
      }
      if (post.path !== path) {
        data.push({ path: post.path!, content: ""});
      }
      data.push({ path, content: newContent });
    } else {
      // update to new format path = category/slug
      const slug = (document.getElementById("post_slug") as HTMLInputElement).value;
      const category = (document.getElementById("post_category") as HTMLInputElement).value.toLocaleLowerCase();
      const title = (document.getElementById("post_title") as HTMLInputElement).value;
      const tldr = (document.getElementById("post_tldr") as HTMLInputElement).value;
      const img = (document.getElementById("post_img") as HTMLInputElement).value;
      const tags = (document.getElementById("post_tags") as HTMLInputElement).value.split(",");
      newIndex[key][slugParam] = {
        ...newIndex[key][slugParam],
        category,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        img,
        tldr,
        title,
        slug,
        tags,
      };
      if (content === newContent && JSON.stringify(newIndex[key][slugParam]) === JSON.stringify(post)) {
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
    if (content === newContent && JSON.stringify(newIndex) === JSON.stringify(adminContext.index) ){
      console.log("no changes detected");
      return;
    }
    data.push({ path: "index.json", content: JSON.stringify(newIndex, null, 2)});
    console.log("Lets push it to git");
    await axios({
      data,
      headers: { "content-type": "application/json" },
      method: "post",
      url: "git/edit",
    });
    await adminContext.syncRef(undefined, slugParam);
    setEditMode(false);

  }

  const createNew = async (as: string) => {
    // create new index.json entry
    const newIndex = JSON.parse(JSON.stringify(adminContext.index))

    const slug = (document.getElementById("post_slug") as HTMLInputElement).value;
    const category = (document.getElementById("post_category") as HTMLInputElement).value.toLocaleLowerCase();
    const title = (document.getElementById("post_title") as HTMLInputElement).value;
    const tldr = (document.getElementById("post_tldr") as HTMLInputElement).value;
    const img = (document.getElementById("post_img") as HTMLInputElement).value;
    const tags = (document.getElementById("post_tags") as HTMLInputElement).value.split(",");

    if (as === "draft") {
      if (!newIndex.drafts) newIndex.drafts = {};
      newIndex.drafts[slug] = {
        category,
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        tldr,
        title,
        img,
        slug,
        tags,
      };
    } else {
      if (!newIndex.posts) newIndex.posts = {};
      newIndex.posts[slug] = {
        category,
        createdOn: (new Date()).toLocaleDateString("en-in"),
        lastEdit: (new Date()).toLocaleDateString("en-in"),
        tldr,
        title,
        img,
        slug,
        tags,
      };
    }

    // Send request to update index.json and create new file
    let res = await axios({
      method: "post",
      url: "git/edit",
      data: [
      {
        path: `${category}/${slug}.md`,
        content: newContent || "Coming Soon",
      },
      {
        path: "index.json",
        content: JSON.stringify(newIndex, null, 2),
      }
    ],
      headers: { "content-type": "application/json" }
    });
    
    if (res.status === 200) {
      adminContext.syncRef(undefined, undefined, true);
    } else { 
      console.log("Something went wrong")
    }
    history.goBack();
  };

  const discard = () => {
    setEditMode(false);
    if (slugParam === "create-new-post") {
      history.goBack();
    }
  }

  if (!slugMatch || slugParam === "admin" || props.readOnly) {
    return (
      <Fab 
      className={classes.speedDial}
      color="primary"
      onClick={() => handleRedirect("/create-new-post")}
      > <Add /> </Fab>
    );
  } else if (slugParam === "create-new-post") {
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
          onClick={discard}
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
          onClick={discard}
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
