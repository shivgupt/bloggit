import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Typography,
  makeStyles,
} from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

import { prettyDateString } from "../utils";

const useStyles = makeStyles(() => ({
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
  const { posts } = props;
  return (
    <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
      {Object.keys(posts).map(slug => {
        if (!posts[slug].category) return;
        return (
          <Grid className={classes.root} item xs={12} md={6} lg={4} key={slug}>
            <Card className={classes.card}>
              <CardActionArea className={classes.card} component={Link} to={`/${slug}`}>
                {posts[slug].img
                  ? <CardMedia
                    className={classes.media}
                    component="img"
                    image={posts[slug].img}
                    title={slug}/>
                  : null}
                <CardContent>
                  <Typography variant="h5" gutterBottom>{posts[slug].title}</Typography>
                  <Typography variant="caption" gutterBottom display="block">
                    {posts[slug].lastEdit ? prettyDateString(posts[slug].lastEdit) : ""}
                    &nbsp;
                    &nbsp;
                    {posts[slug].tags
                      ? <> Tags: {posts[slug].tags.map(tag => <Chip key={tag} label={tag} />)} </>
                      : null
                    }
                    
                  </Typography>
                  <br />
                  <Typography variant="subtitle1" component="p" gutterBottom>
                    {posts[slug].tldr}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};
