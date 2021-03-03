import React, { useEffect, useState } from "react";
import { HistoryResponse } from "@blog/types";
import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Link } from "react-router-dom";
import ExpandIcon from '@material-ui/icons/ExpandMore';
import FastForwardIcon from '@material-ui/icons/FastForward';

import { fetchHistory } from "../utils";

import { Copyable } from "./Copyable";

const useStyles = makeStyles((theme) => ({
  buttonBar: {
    display: "flex",
  },
  button: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(-1),
    marginLeft: theme.spacing(1),
  },
  paper: {
    border: "1px solid #d3d4d5",
    maxHeight: "50%",
  },
}));

export const BrowseHistory = (props: {
  currentRef: string;
  latestRef: string;
  slug: string;
}) => {
  const { currentRef, latestRef, slug } = props;
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const [editHistory, setEditHistory] = useState([] as HistoryResponse);
  const [isHistorical, setIsHistorical] = useState(false);

  useEffect(() => {
    if (latestRef !== currentRef) {
      setIsHistorical(true);
    } else {
      setIsHistorical(false);
    }
  }, [latestRef, currentRef]);

  useEffect(() => {
    if (!slug || slug === "admin") return;
    let unmounted = false;
    (async () => {
      try {
        console.log(`Refreshing history bc slug changed to "${slug}"`);
        const history = await fetchHistory(slug);
        if (!unmounted) setEditHistory(history);
      } catch (e) {
        console.warn(e.message);
      }
    })();
    return () => { unmounted = true; };
  }, [slug]);

  return (

    <div className={classes.buttonBar}>
      <Copyable
        id={"copy-permalink"}
        className={classes.button}
        color={"primary"}
        text={"Permalink"}
        tooltip={"Snapshot of this page that will never change or disappear"}
        value={`${window.location.origin}/${currentRef}/${slug}`}
      />

      <div>
        <Button
          id={"browse-history"}
          className={classes.button}
          startIcon={<ExpandIcon/>}
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          onClick={(event: any) => { setAnchorEl(event.currentTarget); }}
        >
          History
        </Button>
        <Menu
          elevation={0}
          PaperProps={{ className: classes.paper }}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          anchorEl={anchorEl}
          keepMounted
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          {
            editHistory.filter(entry => !entry.commit.startsWith(latestRef)).map(entry => {
              const commit = entry.commit.substring(0,8);
              return (
                <MenuItem
                  component={Link}
                  key={commit}
                  onClick={() => setAnchorEl(null)}
                  selected={commit === currentRef}
                  to={`/${commit}/${slug}`}
                >
                  <ListItemText primary={(new Date(entry.timestamp)).toLocaleString()} />
                </MenuItem>
              );
            })
          }
        </Menu>
      </div>

      {isHistorical
        ? <Button
            id={"jump-to-present"}
            className={classes.button}
            startIcon={<FastForwardIcon/>}
            component={Link}
            color={"primary"}
            variant={"contained"}
            to={`/${slug}`}
          >
            <Typography noWrap variant="body1">
              Jump To Present
            </Typography>
          </Button>
        : null
      }
    </div>
    

  );
}
