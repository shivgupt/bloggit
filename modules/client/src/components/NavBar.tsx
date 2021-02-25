import {
  AppBar,
  Box,
  Button,
  Drawer,
  FormControlLabel,
  Hidden,
  IconButton,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  AccountCircle as AdminAccount,
  Brightness4 as DarkIcon,
  BrightnessHigh as LightIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  AddCircle as AddIcon,
} from "@material-ui/icons";
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";

import { siteTitleFont } from "../style";
import { AdminContext } from "../AdminContext";

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
    marginRight: theme.spacing(1),
  },
  permanentDrawer: {
    width: "20%",
  },
  list: {
    width: "60%",
  },
  rightButton: {
    marginLeft: theme.spacing(1),
  },
  title: {
    flex: 1,
  },
}));

const DrawerContent = (props: any) => {
  const { title, posts, allContent, node, gitRef, setNode, toggleTheme, theme } = props;

  const adminContext = useContext(AdminContext);

  return (
    <>
      <ThemeProvider theme={siteTitleFont}>
        <Typography variant="h4" component="div" >
          <Box textAlign="center" m={2} p={2}>
            {title.site}
          </Box>
        </Typography>
      </ThemeProvider>
      {adminContext.authToken ?
        <>
          <Box textAlign="center" m={1}> 
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={adminContext.adminMode}
                  onChange={() => adminContext.setAdminMode(!adminContext.adminMode)}
                />
              }
              label="Admin"
              labelPlacement="end"
            /> 
          </Box>
          <IconButton
            component={Link}
            edge="start"
            to={"/admin"}
            color="inherit"
          >
            <AdminAccount />
          </IconButton>
        </>
        : null
      }
      <Toc posts={posts} allContent={allContent} node={node} gitRef={gitRef} setNode={setNode}/>
      <IconButton
        onClick={toggleTheme}
        size="small"
        color="secondary"
      >
        {theme.palette.type === "dark" ? <LightIcon /> : <DarkIcon />}
      </IconButton>
      {posts["top-level"]
        ? posts["top-level"].map((p) => {
          return (
            <Box key={p.slug} textAlign="center" m={1}>
              <Button
                size="small"
                disableFocusRipple={false}
                component={Link}
                to={`/${p.slug}`}
              > {p.title} </Button>
            </Box>
          )})
        : null
      }
    </>
  );
};

export const NavBar = (props: any) => {
  const { title } = props;
  const classes = useStyles();
  const [drawer, setDrawer] = useState(false);

  const toggleDrawer = () => setDrawer(!drawer);

  const adminContext = useContext(AdminContext);

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
              onClick={toggleDrawer}
              className={classes.rightButton}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden mdUp>
          <Drawer
            anchor="right"
            open={drawer}
            onClose={toggleDrawer}
            classes={{ paper: classes.list }}
          >
            <DrawerContent {...props} />
          </Drawer>
        </Hidden>
        <Hidden smDown>
          <Drawer
            anchor="right"
            classes={{ paper: classes.permanentDrawer }}
            variant="permanent"
            open
          >
            <DrawerContent {...props} />
          </Drawer>
        </Hidden>
      </nav>
    </>
  );
};
