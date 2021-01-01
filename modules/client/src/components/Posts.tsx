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
  Toolbar,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { groupByCategory } from "../utils";

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

export const Posts = (props: any) => {
    const classes = useStyles();
    const { posts } = props;

    console.log(posts)
    if (!posts) return <p> Loading </p>;
    return (
    <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
    {posts.map(post => {
        return (
        <Grid className={classes.root} item xs={12} md={6} lg={4} key={post.slug}>
            <Card className={classes.card}>
            <CardActionArea component={Link} to={`/${post.slug}`}>
                <CardHeader title={post.title} />
                {post.img
                ? <CardMedia
                    className={classes.media}
                    component="img"
                    image={post.img}
                    title={post.slug}/>
                : null}
                <CardContent>
                <Typography variant="body2" component="p">
                    {post.tldr}
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