import Fab from "@material-ui/core/Fab";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Edit from "@material-ui/icons/Edit";
import Typography from "@material-ui/core/Typography";
import React, { useContext, useEffect, useState } from "react";
import "react-mde/lib/styles/css/react-mde-all.css";
import { useHistory } from "react-router-dom";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";
import { getPrettyDateString } from "../utils";

import { BrowseHistory } from "./BrowseHistory";
import { Markdown } from "./Markdown";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: "864px",
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
    "& p > img": {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    "& p > img + em": {
      display: "block",
      maxWidth: "80%",
      marginTop: theme.spacing(-3),
      marginRight: "auto",
      marginBottom: theme.spacing(4),
      marginLeft: "auto",
    },
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
}: {
  adminMode: string;
}) => {
  const [isHistorical, setIsHistorical] = useState<boolean>(false);
  const [lastEdited, setLastEdited] = useState<string>("");

  const gitContext = useContext(GitContext);
  const history = useHistory();
  const classes = useStyles();

  const { currentRef, latestRef, slug, currentContent, indexEntry } = gitContext.gitState;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const anchor = document.getElementById(hash.substr(1));
      if (anchor) anchor.scrollIntoView();
    }
  },[slug]);

  const publishedOn = indexEntry?.publishedOn ? getPrettyDateString(indexEntry.publishedOn) : null;

  return (
  <div className={classes.root}>
    <BrowseHistory
      currentRef={currentRef}
      latestRef={latestRef}
      isHistorical={isHistorical}
      setIsHistorical={setIsHistorical}
      setLastEdited={setLastEdited}
      slug={slug}
    />

    <Paper variant="outlined" className={classes.paper}>
      { indexEntry?.img
        ? <img
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
      { !isHistorical && lastEdited
        ? <Typography variant="caption" display="block" className={classes.date}>
            Last Updated: {lastEdited}
          </Typography>
        : null
      }
      <Markdown content={currentContent} />
    </Paper>
    {adminMode === "enabled" && !isHistorical
      ? <Fab
          id={"fab"}
          className={classes.fab}
          color="primary"
          onClick={() => {
            history.push(`/admin/edit/${slug}`);
          }}
        ><Edit/></Fab>
      : null
    }
  </div>
  );
};
