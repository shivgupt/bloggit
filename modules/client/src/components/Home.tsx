import { PostData } from "@blog/types";
import Card from "@material-ui/core/Card";
import Fab from "@material-ui/core/Fab";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Add from "@material-ui/icons/Add";
import React, { useContext } from "react";
import Carousel from "react-material-ui-carousel";
import { useHistory, Link } from "react-router-dom";

import { getFabStyle } from "../style";
import { replaceEmojiString } from "../utils";
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
    minWidth: "250px",
    maxWidth: "600px",
    alignContent: "center",
    alignItems: "center",
  },
  fab: getFabStyle(theme),
}));

export const PostCard = ({ post }: { post: PostData }) => {
  const classes = useStyles();

  const slug = post.slug;
  const title = replaceEmojiString(post.title);
  const tldr = replaceEmojiString(post.tldr!);
  const cutoff = post.img ? 140 : 280;
  const publishedOn = post.publishedOn
    ? new Date(post.publishedOn).toLocaleDateString("en", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

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
          {publishedOn
            ? <Typography variant="subtitle1" gutterBottom display="inline">
                {`Published on ${publishedOn}`}
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

export const Home = ({
  adminMode,
  filterBy,
  setEditMode,
}: {
  adminMode: string;
  filterBy?: string,
  setEditMode: (editMode: boolean) => void;
 }) => {
  const gitContext = useContext(GitContext);
  const history = useHistory();
  const classes = useStyles();

  const posts = (gitContext.gitState?.index?.posts || {}) as {[slug: string]: PostData};
  const featured = Object.values(posts).filter((post) => post.featured)

  return (
    <>
      {!filterBy
        ? <>
            <Carousel className={classes.section}
              fullHeightHover={false}
              navButtonsWrapperProps={{
                className: "string",
                style: {
                  top: "calc(75%)",
                }
              }}
              navButtonsProps={{
                className: "string",
                style: {
                  top: "calc(75%)",
                },
              }}
            >
            {featured.map((post: PostData) => 
              <PostCard key={post.slug} post={post} />,
            )}
            </Carousel>
            <Divider variant="middle" />
            <Typography variant="h4" className={classes.section}>
              Archives
            </Typography>
          </>
        : <Typography variant="h4" className={classes.section}>
            All {filterBy} posts
          </Typography>
      }
      <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
        {Object.values(posts).map((post: PostData) => {
          if (!post.category) return null;
          if (post.draft) return null;
          if (!filterBy && post.featured) return null;
          if (filterBy && post.category !== filterBy) {
            return null;
          }
          return (
            <Grid className={classes.root} item xs={12} md={6} lg={4} key={post.slug}>
              <PostCard post={post} />
            </Grid>
          );
        })}
      </Grid>
      {adminMode === "enabled"
        ? <Fab
            id={"fab"}
            className={classes.fab}
            color="primary"
            onClick={() => {
              setEditMode(true);
              history.push("/");
            }}
          ><Add/></Fab>
        : null
      }
    </>
  );
};
