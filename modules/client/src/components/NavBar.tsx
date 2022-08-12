import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import Hidden from "@mui/material/Hidden";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled, Theme, ThemeProvider } from "@mui/material/styles";
import AdminAccount from "@mui/icons-material/Tune";
import CategoryIcon from "@mui/icons-material/Category";
import Close from "@mui/icons-material/Close";
import DarkIcon from "@mui/icons-material/Brightness4";
import DocIcon from "@mui/icons-material/Description";
import HomeIcon from "@mui/icons-material/Home";
import LightIcon from "@mui/icons-material/BrightnessHigh";
import MenuIcon from "@mui/icons-material/Menu";
import NextIcon from "@mui/icons-material/NavigateNext";
import Person from "@mui/icons-material/Person";
import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import { GitContext } from "../GitContext";
import { siteTitleFont } from "../style";
import { getPostsByCategories } from "../utils";

import { Toc } from "./ToC";

const StyledNav = styled("nav")(({ theme }) => ({
  [theme.breakpoints.up("lg")]: {
    width: "20%",
    flexShrink: 0,
  },
}))

const StyledHiddenDrawer = styled(({ className, ...props }: DrawerProps) => (
  <Drawer {...props} classes={{ paper: className }} />
))`
    & .MuiDrawer-paper {
      width: "60%",
    }
`;

const StyledPermanentDrawer = styled(({ className, ...props }: DrawerProps) => (
  <Drawer {...props} classes={{ paper: className }} />
))`
    & .MuiDrawer-paper {
      width: "20%",
    }
`;

const DrawerContent = ({
  adminMode,
  siteTitle,
  theme,
  toggleDrawer,
  toggleTheme,
}: {
  adminMode: string;
  siteTitle: string,
  theme: Theme;
  toggleDrawer: () => void;
  toggleTheme: () => void;
}) => {
  const gitContext = useContext(GitContext);

  const { index } = gitContext.gitState;
  const posts = getPostsByCategories(index?.posts || []);

  return (
    <>
      <Hidden lgUp>
        <IconButton
          id="close-drawer"
          sx={{
            height: 8,
            mb: -4,
            ml: "75%",
          }}
          onClick={toggleDrawer}
          size="small"
        ><Close/></IconButton>
      </Hidden>
      <ThemeProvider theme={siteTitleFont}>
        <Typography variant="h4" component="div" >
          <Box component="div" sx={{ textAlign: "center", m: 2, p: 2}}>
            {siteTitle}
          </Box>
        </Typography>
      </ThemeProvider>
      <IconButton
        onClick={toggleTheme}
        edge="start"
        color="secondary"
      >
        {theme.palette.mode === "dark" ? <LightIcon /> : <DarkIcon />}
      </IconButton>
      <Toc posts={posts}/>
      { adminMode !== "invalid" ?
        <>
          <Box component="div" textAlign="center" m={1}>

            <IconButton
              id="go-to-admin-page"
              component={RouterLink}
              edge="start"
              to={"/admin"}
              color="inherit"
              onClick={toggleDrawer}
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

export const NavBar = ({
  adminMode,
  category,
  theme,
  toggleTheme,
}: {
  adminMode: string;
  category: string;
  theme: Theme,
  toggleTheme: () => void;
}) => {
  const [drawer, setDrawer] = useState<boolean>(false);
  const gitContext = useContext(GitContext);

  const toggleDrawer = () => setDrawer(!drawer);

  const reset = () => {
    window.scrollTo(0, 0);
  };

  const { index, slug } = gitContext.gitState;
  const siteTitle = index?.title || "My Blog";
  const pageTitle = index?.posts?.[slug || ""]?.title || "";
  const post = slug ? index?.posts?.[slug] : null;
  document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;

  return (
    <>
      <AppBar position="fixed" sx={{
        [theme.breakpoints.up("lg")]: {
          width: "80%",
          marginRight: "20%",
        },
        display: "flex",
        justifyContent: "stretch",
      }}>
        <Toolbar>
          <Breadcrumbs aria-label="breadcrumb" separator={<NextIcon fontSize="small"/>}
            sx={{
              flex: 1,
              ml: 1,
            }}
          >
            <Link
              id="go-home"
              sx={{ display: "flex" }}
              component={RouterLink}
              color="inherit"
              onClick={reset}
              to="/"
            >
              <HomeIcon sx={{ marginRight: theme.spacing(0.5), width: "20px", height: "20px" }} />
            </Link>
            {category
              ? <Link
                sx={{ display: "flex" }}
                color="inherit"
                component={RouterLink}
                onClick={reset}
                to={`/category/${category}`}
              >
                <CategoryIcon sx={{ marginRight: theme.spacing(0.5), width: "20px", height: "20px" }} />
                {category}
              </Link>
              : null
            }
            {slug
              ? slug === "admin"
                ? <Typography>
                  <Person sx={{ marginRight: theme.spacing(0.5), width: "20px", height: "20px" }} />
                  Admin
                </Typography>
                : post?.category
                  ? [ <Link
                    key="navbar-category"
                    sx={{ display: "flex" }}
                    color="inherit"
                    component={RouterLink}
                    onClick={reset}
                    to={`/category/${post?.category}`}
                  >
                    <CategoryIcon sx={{ marginRight: theme.spacing(0.5), width: "20px", height: "20px" }} />
                    {post?.category}
                  </Link>,
                  <Typography key="navbar-category-icon" noWrap
                    sx={{
                      [theme.breakpoints.between(0,500)]: {
                        maxWidth: "100px"
                      },
                      [theme.breakpoints.between(500,800)]: {
                        maxWidth: "200px"
                      },
                    }}>
                    <DocIcon sx={{ marginRight: theme.spacing(0.5), width: "20px", height: "20px" }} />
                    {pageTitle}
                  </Typography>
                  ]
                  : <Typography key="navbar-category-icon" noWrap
                      sx={{
                        [theme.breakpoints.between(0,500)]: {
                          maxWidth: "100px"
                        },
                        [theme.breakpoints.between(500,800)]: {
                          maxWidth: "200px"
                        },
                      }}>
                    <DocIcon sx={{ marginRight: theme.spacing(0.5), width: "20px", height: "20px" }} />
                    {pageTitle}
                  </Typography>
              : null
            }
          </Breadcrumbs>
          <Hidden lgUp>
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
      <StyledNav>
        <Hidden lgUp>
          <StyledHiddenDrawer
            anchor="right"
            open={drawer}
            onClose={toggleDrawer}
          >
            <DrawerContent
              adminMode={adminMode}
              siteTitle={siteTitle}
              theme={theme}
              toggleDrawer={toggleDrawer}
              toggleTheme={toggleTheme}
            />
          </StyledHiddenDrawer>
        </Hidden>
        <Hidden mdDown>
          <StyledPermanentDrawer
            anchor="right"
            variant="permanent"
            open
          >
            <DrawerContent
              adminMode={adminMode}
              siteTitle={siteTitle}
              theme={theme}
              toggleDrawer={toggleDrawer}
              toggleTheme={toggleTheme}
            />
          </StyledPermanentDrawer>
        </Hidden>
      </StyledNav>
    </>
  );
};
