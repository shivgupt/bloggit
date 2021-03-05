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

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    height: "420px",
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
  section: {
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
}));

export const Home = (props: { filter?: string, by?: string }) => {
  const { filter, by } = props;
  const classes = useStyles();
  const gitContext = useContext(GitContext);

  const posts = gitContext.gitState?.index?.posts || {};

  return (
    <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
      {Object.keys(posts).map(slug => {
        if (!posts[slug].category) return null;
        if (posts[slug].draft) return null;
        if (filter && by && posts[slug][filter] !== by) {
          return null;
        }

        const title = replaceEmojiString(posts[slug].title);
        const tldr = replaceEmojiString(posts[slug].tldr!);
        const cutoff = posts[slug].img ? 140 : 280;

        return (
          <Grid className={classes.root} item xs={12} md={6} lg={4} key={slug}>
            <Card className={classes.card}>
              <CardActionArea disableRipple className={classes.card} component={Link} to={`/${slug}`}>
                {posts[slug].img
                  ? <div className={classes.wrapper}><CardMedia
                      className={classes.media}
                      component="img"
                      image={posts[slug].img}
                      title={slug}
                    /></div>
                  : null}
                <CardContent>
                  <Typography variant="h5" gutterBottom display="block">{title}</Typography>
                  {posts[slug].publishedOn
                    ? <Typography variant="caption" gutterBottom display="inline">
                        {prettyDateString(posts[slug].publishedOn!)}
                      </Typography>
                    : ""
                  }
                  &nbsp;
                  <Chip
                    label={posts[slug].category}
                    component={Link}
                    to={`/category/${posts[slug].category}`}
                    clickable
                    disableRipple
                  />
                  <Typography variant="subtitle1" component="p" gutterBottom className={classes.section}>
                    {tldr.substr(0,cutoff)} {tldr.length > cutoff ? "..." : null}
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
