import React, { useContext, useState } from "react";
import { makeStyles, Fab, Theme } from "@material-ui/core"
import {
  SpeedDial,
  SpeedDialAction
} from "@material-ui/lab";
import {
  Add,
  AddCircle,
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
    right: theme.spacing(2),
  },
}));

export const AppSpeedDial = () => {
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const adminContext = useContext(AdminContext);
  const { newContent, updateNewContent, editMode, setEditMode } = adminContext;

  const slugMatch = useRouteMatch("/:slug");
  const slugParam = slugMatch ? slugMatch.params.slug : "";

  //console.log(slugMatch, refMatch, refParam, slugParam);

  let dialButtonRef;

  const handleRedirect = (to: string) => history.push(to)
  const handleOpen = () => {
  }

  const save = async (as: string) => {
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


  if (!slugMatch || slugParam === "admin") {
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
          icon={<Drafts />}
          tooltipTitle="Save Drafts"
          onClick={() => save("draft")}
        />
        <SpeedDialAction
          icon={<Public />}
          tooltipTitle="Publish"
          onClick={() => save("post")}
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
          icon={<Drafts />}
          tooltipTitle="Save Drafts"
          onClick={() => save("draft")}
        />
        <SpeedDialAction
          icon={<Public />}
          tooltipTitle="Publish"
          onClick={() => save("post")}
        />
      </SpeedDial>
    )
  }
}