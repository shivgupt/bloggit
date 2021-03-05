import {
  AppBar,
  Box,
  Button,
  Drawer,
  Hidden,
  IconButton,
  Link,
  ThemeProvider,
  Toolbar,
  Typography,
  makeStyles,
  Breadcrumbs,
} from "@material-ui/core";
import {
  Tune as AdminAccount,
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
  closeDrawer: {
    height: theme.spacing(8),
    marginBottom: theme.spacing(-4),
    marginLeft: "75%",
  },
  breadcrumb: {
    flex: 1,
    marginLeft: theme.spacing(1),
  },
}));

const DrawerContent = (props: any) => {
  const { siteTitle, node, setNode, toggleTheme, toggleDrawer, theme, adminMode } = props;
  const classes = useStyles();
  const gitContext = useContext(GitContext);
  const { index } = gitContext.gitState;
  const posts = getPostsByCategories(index?.posts || []);

  return (
    <>
      <Hidden mdUp>
        <IconButton
          className={classes.closeDrawer}
          onClick={() => toggleDrawer()}
          size="small"
        ><Close/></IconButton>
      </Hidden>
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
      { adminMode !== "invalid" ?
        <>
          <Box textAlign="center" m={1}>

            <IconButton
              id="go-to-admin-page"
              component={RouterLink}
              edge="start"
              to={"/admin"}
              color="inherit"
              onClick={() => toggleDrawer()}
            >
              <AdminAccount />
            </IconButton>

          </Box>
        </>
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

  return (
    <>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Breadcrumbs aria-label="breadcrumb" separator={<NextIcon fontSize="small"/>} className={classes.breadcrumb}>
            <Link
              id="go-home"
              className={classes.link}
              component={RouterLink}
              color="inherit"
              onClick={() => setEditMode(false)}
              to="/"
            >
              <HomeIcon className={classes.icon} />
            </Link>
            {categoryMatch
            ? <Link
                className={classes.link}
                color="inherit"
                component={RouterLink}
                onClick={() => setEditMode(false)}
                to={`/category/${categoryMatch.params.slug}`}
              >
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
              : [ <Link
                    key="navbar-category"
                    className={classes.link}
                    color="inherit"
                    component={RouterLink}
                    onClick={() => setEditMode(false)}
                    to={`/category/${post?.category}`}
                  >
                    <CategoryIcon className={classes.icon} />
                    {post?.category}
                  </Link>,
                  <Typography key="navbar-category-icon">
                    <DocIcon className={classes.icon} />
                    {pageTitle}
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
            <DrawerContent siteTitle={siteTitle} toggleDrawer={toggleDrawer} {...props} />
          </Drawer>
        </Hidden>
      </nav>
    </>
  );
};
