import React, { useState, useEffect } from 'react';
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
import { Toc } from './ToC';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  homeButton: {
    marginRight: theme.spacing(2),
  },
  list: {
    width: '40%',
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
    setNode,
    node,
  } = props;

  const [drawer, setDrawer] = useState({open: false});

  const toggleDrawer = (open) => event => {
      if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
      setDrawer({open: open});
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
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        anchor="right"
        open={drawer.open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        classes={{paper: classes.list}}
      >
        <Toc posts={posts} node={node} setNode={setNode}/>
      </SwipeableDrawer>
    </div>
  )
}
