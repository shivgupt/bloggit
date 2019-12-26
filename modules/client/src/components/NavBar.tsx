import React from 'react';
import {
  makeStyles,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from '@material-ui/core';
import {
  Menu as MenuIcon,
} from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
}));

export const NavBar = (props: any) => {
  const classes = useStyles();
  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            My Blog
          </Typography>
      </AppBar>
    </div>
  )
}
