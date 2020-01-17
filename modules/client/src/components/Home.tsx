import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => createStyles({
  card: {
    width: 345,
    height: 245,
  },
}))

export const Home = (props: any) => {
  const classes = useStyles();
  const {posts, title, setTitle} = props;

  useEffect(() => {
    setTitle({ ...title });
    document.title = title.primary;
  }, [title]);

  return (
      <Grid container spacing={3} justify={"space-around"} alignItems={'center'}>
        {posts.map((post) => {
          return (
            <Grid item key={post.slug}>
              <CardActionArea component={Link} to={`/post/${post.slug}`}>
                <Card className={classes.card}>
                  <CardHeader title={post.title} />
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" component="p">
                      {post.tldr}
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            </Grid>
          )
        })}
      </Grid>
  )
}
