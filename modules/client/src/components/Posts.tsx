import Fab from "@material-ui/core/Fab";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Edit from "@material-ui/icons/Edit";
import Typography from "@material-ui/core/Typography";
import React, { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { getPrettyDateString } from "src/utils";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";

import { BrowseHistory } from "./BrowseHistory";
import {
  CodeBlockRenderer,
  TextRenderer,
  HeadingRenderer,
  ImageRenderer,
  LinkRenderer
} from "./Renderers";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: "700px",
    width: "100%",
  },
  paper: {
    flexGrow: 1,
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
  date: {
    paddingLeft: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
  text: {
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
  },
  media: {
    [theme.breakpoints.up("md")]: {
      height: 500,
    },
    [theme.breakpoints.down("sm")]: {
      height: 300,
    }
  },
  fab: getFabStyle(theme),
}));

export const PostPage = ({
  adminMode,
  setEditMode,
}: {
  adminMode: string;
  setEditMode: (editMode: boolean) => void;
}) => {
  const [isHistorical, setIsHistorical] = useState<boolean>(false);
  const gitContext = useContext(GitContext);
  const classes = useStyles();

  const { currentRef, latestRef, slug, currentContent, indexEntry } = gitContext.gitState;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const anchor = document.getElementById(hash.substr(1));
      if (anchor) anchor.scrollIntoView();
    }
  },[slug]);

  const lastEdit = indexEntry?.lastEdit ? getPrettyDateString(indexEntry.lastEdit) : null;
  const publishedOn = indexEntry?.publishedOn ? getPrettyDateString(indexEntry.publishedOn) : null;

  return (
  <div className={classes.root}>
    <BrowseHistory
      currentRef={currentRef}
      latestRef={latestRef}
      isHistorical={isHistorical}
      setIsHistorical={setIsHistorical}
      slug={slug}
    />

    <Paper variant="outlined" className={classes.paper}>
      { indexEntry?.img
        ? <ImageRenderer
            src={indexEntry.img}
            alt={indexEntry.img}
            style={{
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              display: "block",
              margin: "0 auto 16px auto",
              maxWidth: "100%",
              width: "100%",
            }}
          />
        : null
      }
      { publishedOn
        ? <Typography variant="caption" display="block" className={classes.date}>
            Published On: {publishedOn}
          </Typography>
        : null
      }
      { !isHistorical && lastEdit
        ? <Typography variant="caption" display="block" className={classes.date}>
            Last Edited: {lastEdit}
          </Typography>
        : null
      }
      <Markdown
        source={currentContent}
        className={classes.text}
        renderers={{
          heading: HeadingRenderer,
          code: CodeBlockRenderer,
          text: TextRenderer,
          link: LinkRenderer,
          image: ImageRenderer,
        }}
      />
    </Paper>
    {adminMode === "enabled" && !isHistorical
      ? <Fab
          id={"fab"}
          className={classes.fab}
          color="primary"
          onClick={() => {
            setEditMode(true);
          }}
        ><Edit/></Fab>
      : null
    }
  </div>
  );
};
