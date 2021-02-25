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
import emoji from "emoji-dictionary";

import { prettyDateString } from "../utils";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
  },
  card: {
    display: "flex",
  },
  content: {
    flex: '1 0 auto',
  },
  details: {
    display: "flex",
    flexDirection: 'column',
  },
  wrapper: {
    [theme.breakpoints.up("md")]: {
      width: "40%",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
    height: "150px",
    overflow: "hidden",
  },
  media: {
    height: "auto",
    width: "100%",
    marginTop: "-40%",
  },
}));

export const Home = (props: any) => {
  const classes = useStyles();
  const { posts } = props;

  return (
    <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
      {Object.keys(posts).map(slug => {
        if (!posts[slug].category) return ;

        const title = posts[slug].title.replace(/:\w+:/gi, name => emoji.getUnicode(name) || name);
        const tldr = posts[slug].tldr.replace(/:\w+:/gi, name => emoji.getUnicode(name) || name);

        return (
          <Grid className={classes.root} item xs={12} md={12} lg={12} key={slug}>
            <Card className={classes.card}>
              <CardActionArea component={Link} to={`/${slug}`}>
                <div className={classes.details}>
                <CardContent className={classes.content}>
                  <Typography variant="h5" gutterBottom>{title}</Typography>
                  <Typography variant="caption" gutterBottom display="block">
                    {posts[slug].createdOn ? prettyDateString(posts[slug].createdOn) : ""}
                    &nbsp;
                    &nbsp;
                    {posts[slug].tags
                      ? <> Tags: {posts[slug].tags.map(tag => <Chip key={tag} label={tag} />)} </>
                      : null
                    }
                  </Typography>
                  <br />
                  <Typography variant="subtitle1" component="p" gutterBottom>
                    {tldr.substr(0,140)} ...
                  </Typography>
                </CardContent>
                </div>
                {posts[slug].img
                  ? <div className={classes.wrapper}><CardMedia
                      className={classes.media}
                      component="img"
                      image={posts[slug].img}
                      title={slug}
                    /></div>
                  : null}
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};
