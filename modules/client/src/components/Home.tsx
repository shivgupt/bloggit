import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  Typography,
  makeStyles,
} from "@material-ui/core";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Carousel from 'react-material-ui-carousel';
import { PostData } from "@blog/types";

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
  actionArea: {
    width: "100%",
  },
  contentActionArea: {
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
    maxWidth: "600px",
    alignContent: "center",
    alignItems: "center",
  },
}));

export const PostCard = (props: { post: PostData }) => {
  const classes = useStyles();
  const post = props.post;
  console.log(post);
  const slug = post.slug;

  const title = replaceEmojiString(post.title);
  const tldr = replaceEmojiString(post.tldr!);
  const cutoff = post.img ? 140 : 280;

  return (
    <Card className={classes.card}>
      <CardActionArea disableRipple className={classes.actionArea} component={Link} to={`/${slug}`}>
        {post.img
          ? <div className={classes.wrapper}><CardMedia
              className={classes.media}
              component="img"
              image={post.img}
              title={slug}
            /></div>
          : null}
      </CardActionArea>
      <CardContent>
        <CardActionArea disableRipple className={classes.actionArea} component={Link} to={`/${slug}`}>
          <Typography variant="h5" gutterBottom display="block">{title}</Typography>
          {post.publishedOn
            ? <Typography variant="button" gutterBottom display="inline">
                {prettyDateString(post.publishedOn!)}
              </Typography>
            : ""
          }
        </CardActionArea>
          &nbsp;
          <Chip
            label={post.category}
            component={Link}
            to={`/category/${post.category}`}
            clickable
          />
        <CardActionArea disableRipple className={classes.contentActionArea} component={Link} to={`/${slug}`}>
          <Typography variant="caption" component="p" gutterBottom className={classes.section}>
            {tldr.substr(0,cutoff)} {tldr.length > cutoff ? "..." : null}
          </Typography>
        </CardActionArea>
      </CardContent>
    </Card>
  )
}

export const Home = (props: { filter?: string, by?: string }) => {
  const { filter, by } = props;
  const classes = useStyles();
  const gitContext = useContext(GitContext);

  const posts = gitContext.gitState?.index?.posts || {};
  if (Object.keys(posts).length === 0) return <> Loading </>;

  return (
    <>
      {! (filter && by)
        ? <>
            <Carousel className={classes.section}
              fullHeightHover={false}
              navButtonsWrapperProps={{
                className: "string",
                style: {
                  top: "calc(70%)",
                }
              }}
              navButtonsProps={{
                className: "string",
                style: {
                  top: "calc(70%)",
                },
              }}
            >
            {
            [
              <PostCard key="1" post={posts["deplatformed"]} />,
              <PostCard key="2" post={posts["malai-kofta"]} />
            ]
            }
            </Carousel>
            <Divider variant="middle" />
            <Typography variant="h4" className={classes.section}>
              Archives
            </Typography>
          </>
        : <Typography variant="h4" className={classes.section}>
            All '{by}' posts
          </Typography>
      }
      <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
        {Object.keys(posts).map(slug => {
          if (!posts[slug].category) return null;
          if (posts[slug].draft) return null;
          if (filter && by && posts[slug][filter] !== by) {
            return null;
          }
          return (
            <Grid className={classes.root} item xs={12} md={6} lg={4} key={slug}>
              <PostCard post={posts[slug]} />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
