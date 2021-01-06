import {
  AppBar,
  Drawer,
  Hidden,
  IconButton,
  SwipeableDrawer,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  Home as HomeIcon,
  Menu as MenuIcon,
  SettingsInputComposite as LogIcon,
} from "@material-ui/icons";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Toc } from "./ToC";

const useStyles = makeStyles(theme => ({
  appBar: {
    [theme.breakpoints.up("md")]: {
      width: "80%",
      marginRight: "20%",
    },
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: "20%",
      flexShrink: 0,
    },
  },
  grow: {
    borderBottom: `5px solid ${theme.palette.divider}`,
  },
  homeButton: {
    marginRight: theme.spacing(2),
  },
  permanentDrawer: {
    width: "20%",
  },
  list: {
    width: "40%",
  },
  rightButton: {
    marginLeft: theme.spacing(2),
  },
  title: {
    flex: 1,
  },
}));

export const NavBar = (props: any) => {
  const { posts, setNode, node, title } = props;
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
    <>
      <AppBar position="fixed" className={classes.appBar}>
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
            component={Link}
            edge="start"
            to={"/foodlog"}
            color="inherit"
            className={classes.rightButton}
          >
            <LogIcon />
          </IconButton>
          <Hidden mdUp>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer(true)}
              className={classes.rightButton}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden mdUp>
          <SwipeableDrawer
            anchor="right"
            open={drawer.open}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
            classes={{ paper: classes.list }}
          >
            <Toc posts={posts} node={node} setNode={setNode}/>
          </SwipeableDrawer>
        </Hidden>
        <Hidden smDown>
          <Drawer
            anchor="right"
            classes={{ paper: classes.permanentDrawer }}
            variant="permanent"
            open
          >
            <Toc posts={posts} node={node} setNode={setNode}/>
          </Drawer>
        </Hidden>
      </nav>
    </>
  );
};
