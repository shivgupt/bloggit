import {
  AppBar,
  Button,
  Box,
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
} from "@material-ui/icons";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Toc } from "./ToC";

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
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
            {title.page ? title.page : "Home"}
          </Typography>
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
            <Typography variant="subtitle1" component="div" >
              <Box fontFamily="Zapfino" fontStyle="italic" textAlign="center" m={1} p={1}>
                {title.site}
              </Box>
            </Typography>
            <Toc posts={posts} node={node} setNode={setNode}/>
            <Button
              size="small"
              disableFocusRipple={false}
              component={Link}
              to={"/about"}
            > About </Button>
          </SwipeableDrawer>
        </Hidden>
        <Hidden smDown>
          <Drawer
            anchor="right"
            classes={{ paper: classes.permanentDrawer }}
            variant="permanent"
            open
          >
            <Typography variant="h6" component="div" >
              <Box fontFamily="Zapfino" fontStyle="italic" textAlign="center" m={2} p={2}>
                {title.site}
              </Box>
            </Typography>
            <Toc posts={posts} node={node} setNode={setNode}/>
            <Button
              size="small"
              disableFocusRipple={false}
              component={Link}
              to={"/about"}
            > About </Button>
          </Drawer>
        </Hidden>
      </nav>
    </>
  );
};
