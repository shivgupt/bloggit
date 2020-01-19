import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
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
}));

export const Home = (props: any) => {
  const classes = useStyles();
  const { posts } = props;
  return (
    <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
      {Object.keys(posts).map(slug => {
        return (
          <Grid item key={slug}>
            <CardActionArea component={Link} to={`/post/${slug}`}>
              <Card className={classes.card}>
                <CardHeader title={posts[slug].title} />
                <CardContent>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {posts[slug].tldr}
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>
          </Grid>
        );
      })}
    </Grid>
  );
};
