import React, { useEffect, useState } from "react";
import { HistoryResponse } from "@blog/types";
import { makeStyles } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
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
    marginTop: theme.spacing(-1.75),
    paddingLeft: theme.spacing(1),
  },
  paper: {
    border: "1px solid #d3d4d5",
    maxHeight: "50%",
  },
}));

export const BrowseHistory = ({
  currentRef,
  isHistorical,
  latestRef,
  setIsHistorical,
  slug,
}: {
  currentRef: string;
  isHistorical: boolean;
  latestRef: string;
  setIsHistorical: (val: boolean) => void;
  slug: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<any>(null); // TODO: provide type?
  const [editHistory, setEditHistory] = useState<HistoryResponse>([]);
  const classes = useStyles();

  useEffect(() => {
    if (latestRef !== currentRef) {
      setIsHistorical(true);
    } else {
      setIsHistorical(false);
    }
  // I don't think state setters (ie setIsHistorical) should be included as a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Grid container spacing={1} className={classes.buttonBar}>

      <Grid item>
        <Copyable
          id="copy-permalink"
          color="primary"
          size={"medium"}
          text="Permalink"
          tooltip="Snapshot of this page that will never change or disappear"
          value={`${window.location.origin}/${currentRef}/${slug}`}
        />
      </Grid>

      <Grid item>
        <Button
          id="open-history"
          startIcon={<ExpandIcon/>}
          aria-haspopup="true"
          variant="contained"
          size={"medium"}
          color="primary"
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
            setAnchorEl(event.currentTarget);
          }}
        >
          <Typography noWrap variant="button">
            History
          </Typography>
        </Button>
      </Grid>

      {isHistorical
        ? <Grid item>
            <Tooltip arrow placement="bottom" title="Go to latest version">
              <Button
                color="primary"
                component={Link}
                id="jump-to-present"
                size={"medium"}
                to={`/${slug}`}
                variant="contained"
              >
                <FastForwardIcon/>
              </Button>
            </Tooltip>
          </Grid>
        : null
      }

      <Menu
        elevation={0}
        PaperProps={{ id: "history-menu", className: classes.paper }}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {
          editHistory.filter(entry => !entry.commit.startsWith(latestRef)).map((entry, i) => {
            const commit = entry.commit.substring(0,8);
            const key = `history-entry-${i+1}`;
            return (
              <MenuItem
                component={Link}
                id={key}
                key={key}
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

    </Grid>
  );
};
