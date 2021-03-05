import {
  AppBar,
  Box,
  Button,
  Drawer,
  FormControlLabel,
  Hidden,
  IconButton,
  Link,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
  makeStyles,
  Breadcrumbs,
} from "@material-ui/core";
import {
  AccountCircle as AdminAccount,
  Brightness4 as DarkIcon,
  BrightnessHigh as LightIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Menu as MenuIcon,
  NavigateNext as NextIcon,
  Person,
  Description as DocIcon,
  Close,
} from "@material-ui/icons";
import React, { useState, useContext } from "react";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";

import { siteTitleFont } from "../style";
import { getPostsByCategories } from "../utils";
import { GitContext } from "../GitContext";

import { Toc } from "./ToC";

const useStyles = makeStyles(theme => ({
  appBar: {
    [theme.breakpoints.up("md")]: {
      width: "80%",
      marginRight: "20%",
    },
    display: "flex",
    justifyContent: "stretch",
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: "20%",
      flexShrink: 0,
    },
  },
  link: {
    display: "flex",
  },
  grow: {
    borderBottom: `5px solid ${theme.palette.divider}`,
  },
  icon: {
    marginRight: theme.spacing(0.5),
    width: "20px",
    height: "20px",
  },
  permanentDrawer: {
    width: "20%",
  },
  hiddenDrawer: {
    width: "60%",
  },
  title: {
    flex: 1,
    marginLeft: theme.spacing(1),
  },
}));

const DrawerContent = (props: any) => {
  const { siteTitle, node, setNode, toggleTheme, toggleDrawer, theme, adminMode, setAdminMode } = props;

  const gitContext = useContext(GitContext);
  const { index } = gitContext.gitState;
  const posts = getPostsByCategories(index?.posts || []);

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
      ><Close /></IconButton>
      <ThemeProvider theme={siteTitleFont}>
        <Typography variant="h4" component="div" >
          <Box textAlign="center" m={2} p={2}>
            {siteTitle}
          </Box>
        </Typography>
      </ThemeProvider>
      <IconButton
        onClick={toggleTheme}
        edge="start"
        color="secondary"
      >
        {theme.palette.type === "dark" ? <LightIcon /> : <DarkIcon />}
      </IconButton>
      { adminMode !== "invalid" ?
        <>
          <Box textAlign="center" m={1}>

            <IconButton
              id="go-to-admin-page"
              component={RouterLink}
              edge="start"
              to={"/admin"}
              color="inherit"
            >
              <AdminAccount />
            </IconButton>

            <FormControlLabel
              id="toggle-admin-mode"
              control={
                <Switch
                  size="small"
                  checked={adminMode === "enabled"}
                  onChange={() => {
                    if (adminMode === "enabled") setAdminMode("disabled");
                    else setAdminMode("enabled");
                  }}
                />
              }
              label="Admin Mode"
              labelPlacement="start"
            />

          </Box>
        </>
        : null
      }
      <Toc posts={posts} node={node} setNode={setNode}/>
      {posts["top-level"]
        ? posts["top-level"].map((p) => {
          return (
            <Box key={p.slug} textAlign="center" m={1}>
              <Button
                size="small"
                disableFocusRipple={false}
                component={RouterLink}
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
  const { setEditMode } = props;
  const gitContext = useContext(GitContext);
  const categoryMatch = useRouteMatch("/category/:slug");
  const classes = useStyles();
  const [drawer, setDrawer] = useState(false);

  const toggleDrawer = () => setDrawer(!drawer);

  const { index, slug } = gitContext.gitState;
  const siteTitle = index?.title || "My Blog";
  const pageTitle = index?.posts?.[slug || ""]?.title || "";
  const post = slug ? index?.posts?.[slug] : null;
  document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;

  console.log(categoryMatch)
  console.log(slug)

  return (
    <>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Breadcrumbs aria-label="breadcrumb" separator={<NextIcon fontSize="small"/>} className={classes.title}>
            <Link id="go-home" className={classes.link} color="inherit" onClick={() => setEditMode(false)} href="/">
              <HomeIcon className={classes.icon} />
              Home
            </Link>
            {categoryMatch
            ? <Link className={classes.link} color="inherit" onClick={() => setEditMode(false)} href={`/category/${categoryMatch.params.slug}`}>
                <CategoryIcon className={classes.icon} />
                {categoryMatch.params.slug}
              </Link>
            : null
            }
            {slug
            ? slug === "admin"
              ? <Typography>
                  <Person className={classes.icon} />
                  Admin
                </Typography>
              : [ <Link className={classes.link} color="inherit" onClick={() => setEditMode(false)} href={`/category/${post?.category}`}>
                    <CategoryIcon className={classes.icon} />
                    {post?.category}
                  </Link>,
                  <Typography>
                    <DocIcon className={classes.icon} />
                    {pageTitle.substr(0,10)}..
                  </Typography>
                ]
            : null
            }
          </Breadcrumbs>
          <Hidden mdUp>
            <IconButton
              id="open-drawer"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
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
            classes={{ paper: classes.hiddenDrawer }}
          >
            <DrawerContent siteTitle={siteTitle} toggleDrawer={toggleDrawer} {...props} />
          </Drawer>
        </Hidden>
        <Hidden smDown>
          <Drawer
            anchor="right"
            classes={{ paper: classes.permanentDrawer }}
            variant="permanent"
            open
          >
            <DrawerContent siteTitle={siteTitle} {...props} />
          </Drawer>
        </Hidden>
      </nav>
    </>
  );
};
