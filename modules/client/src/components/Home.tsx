import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => createStyles({
  card: {
    width: 345,
    height: 245,
  },
  media: {
    maxHeight: 100,
  },
}));

export const Home = (props: any) => {
  const classes = useStyles();
  const { posts } = props;
  return (
    <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
      {Object.keys(posts).map(slug => {
        return (
          <Grid item key={slug}>
            <Card className={classes.card}>
              <CardActionArea component={Link} to={`/${slug}`}>
                <CardHeader title={posts[slug].title} />
                <CardMedia
                  className={classes.media}
                  component="img"
                  image={posts[slug].img}
                  title={slug}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary" component="p">
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
