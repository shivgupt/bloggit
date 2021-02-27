import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Link } from "react-router-dom";
import ExpandIcon from '@material-ui/icons/ExpandMore';
import FastForwardIcon from '@material-ui/icons/FastForward';

import { PostHistory } from "../types";
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
}));

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
    maxHeight: "50%",
  },
})((props: any) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

export const BrowseHistory = (props: {
  currentRef: string;
  latestRef: string;
  slug: string;
}) => {
  const { currentRef, latestRef, slug } = props;
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const [editHistory, setEditHistory] = useState([] as PostHistory);
  const [isHistorical, setIsHistorical] = useState(false);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (latestRef !== currentRef) {
      setIsHistorical(true);
    } else {
      setIsHistorical(false);
    }
  }, [latestRef, currentRef]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        console.log(`Fetching history bc slug changed to "${slug}"`);
        setEditHistory(await fetchHistory(slug));
      } catch (e) {
        console.warn(e.message);
        setEditHistory([]);
      }
    })();
  }, [slug]);

  return (

    <div className={classes.buttonBar}>
      <Copyable
        className={classes.button}
        color={"primary"}
        text={"Permalink"}
        tooltip={"Snapshot of this page that will never change or disappear"}
        value={`${window.location.origin}/${currentRef}/${slug}`}
      />

      <div>
        <Button
          className={classes.button}
          startIcon={<ExpandIcon/>}
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          onClick={handleOpen}
        >
          History
        </Button>
        <StyledMenu
          id="customized-menu"
          anchorEl={anchorEl}
          keepMounted
          open={!!anchorEl}
          onClose={handleClose}
        >
          {
            editHistory.map(entry => {
              const commit = entry.commit.substring(0,8);
              return (
                <MenuItem
                  component={Link}
                  key={commit}
                  onClick={handleClose}
                  selected={commit === currentRef}
                  to={`/${commit}/${slug}`}
                >
                  <ListItemText primary={(new Date(entry.timestamp)).toLocaleString()} />
                </MenuItem>
              );
            })
          }
        </StyledMenu>
      </div>

      {isHistorical
        ? <Button
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
