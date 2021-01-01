import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  Link,
  Theme,
  Typography,
  createStyles,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
  },
  link: {
    padding: theme.spacing(1),
    flexShrink: 0,
  },
}));

export const Home = (props: any) => {
  const classes = useStyles();
  const { categories } = props;

  return (
    <>
      <Toolbar>
        {categories.map((category) => (
          <Link
            noWrap
            key={category}
            variant="body2"
            className={classes.link}
            href={`/categories/${category}`}

          > {category} </Link>
        ))}
      </Toolbar>
    </>
  );
};
