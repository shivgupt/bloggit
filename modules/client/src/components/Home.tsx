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
import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { prettyDateString, replaceEmojiString } from "../utils";
import { GitContext } from "../GitContext";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    height: "300px",
  },
  wrapper: {
    width: "100%",
    height: "150px",
    overflow: "hidden",
  },
  media: {
    height: "auto",
    maxWidth: "100%",
    marginTop: "-40%",
  },
}));

export const Home = () => {
  const classes = useStyles();
  const gitContext = useContext(GitContext);
  const posts = gitContext.gitState?.index?.posts || [];

  return (
    <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
      {Object.keys(posts).map(slug => {
        if (!posts[slug].category) return null;

        const title = replaceEmojiString(posts[slug].title);
        const tldr = replaceEmojiString(posts[slug].tldr!);

        return (
          <Grid className={classes.root} item xs={12} md={6} lg={4} key={slug}>
            <Card className={classes.card}>
              <CardActionArea className={classes.card} component={Link} to={`/${slug}`}>
                {posts[slug].img
                  ? <div className={classes.wrapper}><CardMedia
                      className={classes.media}
                      component="img"
                      image={posts[slug].img}
                      title={slug}
                    /></div>
                  : null}
                <CardContent>
                  <Typography variant="h5" gutterBottom>{title}</Typography>
                  <Typography variant="caption" gutterBottom display="block">
                    {posts[slug].lastEdit ? prettyDateString(posts[slug].lastEdit!) : ""}
                    &nbsp;
                    &nbsp;
                    {posts[slug].tags
                      ? <> Tags: {posts[slug].tags?.map(tag => <Chip key={tag} label={tag} />)} </>
                      : null
                    }
                  </Typography>
                  <br />
                  <Typography variant="subtitle1" component="p" gutterBottom>
                    {tldr}
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
