import React from 'react';
import {
  makeStyles,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  SwipeableDrawer,
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { Toc } from './ToC';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  homeButton: {
    marginRight: theme.spacing(2),
  },
  menuButton: {
    marginLeft: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export const NavBar = (props: any) => {
  const classes = useStyles();
  const {
    posts,
    setState,
    state,
  } = props;

  const toggleDrawer = (open) => event => {
      if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
      setState({...state, open: open});
    };

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            component={Link}
            edge="start"
            to={'/home'}
            color="inherit"
            className={classes.homeButton}
          >
            <HomeIcon />
          </IconButton>
          <Typography className={classes.title} variant="h5" noWrap>
            My Blog
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
          <SwipeableDrawer
            anchor="right"
            open={state.open}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
          >
            <Toc toggleDrawer={toggleDrawer} posts={posts} state={state} setState={setState}/>
          </SwipeableDrawer>
        </Toolbar>
      </AppBar>
    </div>
  )
}
