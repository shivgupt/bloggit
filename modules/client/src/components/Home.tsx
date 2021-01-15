import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Posts } from "./Posts"

import { prettyDateString } from "../utils";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    height: 300,
  },
  media: {
    maxHeight: 150,
  },
}));

export const Home = (props: any) => {
  const classes = useStyles();
  const { index } = props;
  const [featured, setFeatured] = useState({});

  useEffect(() => {
    if (index.featured) {
      const f = {};
      index.featured.forEach( p => {
        f[p] = index.posts[p];
      });
      console.log(f)
      setFeatured(f);
    }
  }, [index])

  return (
    <Posts posts={featured} />
  );
};
