import {
  AppBar,
  IconButton,
  SwipeableDrawer,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  Home as HomeIcon,
  Menu as MenuIcon,
} from "@material-ui/icons";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Toc } from "./ToC";

const useStyles = makeStyles(theme => ({
  grow: {
    borderBottom: `5px solid ${theme.palette.divider}`,
  },
  homeButton: {
    marginRight: theme.spacing(2),
  },
  list: {
    width: "40%",
  },
  menuButton: {
    marginLeft: theme.spacing(2),
  },
  title: {
    flex: 1,
  },
}));

export const NavBar = (props: any) => {
  const { content, posts, setNode, node, title } = props;
  const classes = useStyles();
  const [drawer, setDrawer] = useState({ open: false });

  const toggleDrawer = (open) => event => {
    // what's the goal of ignoring some of these events?
    if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawer({ open: open });
  };

  return (
    <div className={classes.grow}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            component={Link}
            edge="start"
            to={"/"}
            color="inherit"
            className={classes.homeButton}
          >
            <HomeIcon />
          </IconButton>
          <Typography
            className={classes.title}
            variant="h5"
            align={"center"}
            component={"h2"}
            noWrap
          >
            {title.page ? title.page : title.site}
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer(true)}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        anchor="right"
        open={drawer.open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        classes={{ paper: classes.list }}
      >
        <Toc content={content} posts={posts} node={node} setNode={setNode}/>
      </SwipeableDrawer>
    </div>
  );
};
