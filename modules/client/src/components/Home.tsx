import { PostData } from "@blog/types";
import Card from "@material-ui/core/Card";
import Fab from "@material-ui/core/Fab";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
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
import { getPrettyDateString, replaceEmojiString } from "../utils";
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
  cardContent: {
    background: "rgba(66,  66,  66,  0.80)",
    opacity: "0.999",
    height: "420px",
  },
  cardImageWrapper: {
    width: "100%",
    height: "210px",
  },
  cardImage: {
    height: "auto",
    maxWidth: "100%",
  },
  carousel: {
    margin: theme.spacing(1, 1),
    width: "100%",
    maxWidth: "420px",
  },
  section: {
    margin: theme.spacing(1, 1),
    alignContent: "center",
    alignItems: "center",
  },
  chip: {
    marginRight: theme.spacing(1),
  },
  fab: getFabStyle(theme),
}));

export const PostCard = ({ post }: { post: PostData }) => {
  const classes = useStyles();

  const slug = post.slug;
  const title = replaceEmojiString(post.title);
  const tldr = replaceEmojiString(post.tldr!);
  const cutoff = post.img ? 140 : 280;
  const publishedOn = post.publishedOn ? getPrettyDateString(post.publishedOn) : null;

  return (
    <Card className={classes.card}>
      <CardActionArea disableRipple className={classes.actionArea} component={Link} to={`/${slug}`}>
        {post.img
          ? <div className={classes.cardImageWrapper}>
              <img
                className={classes.cardImage}
                src={post.img}
                alt={slug}
              />
            </div>
          : null}
      </CardActionArea>
      <CardContent className={classes.cardContent}>
        <CardActionArea disableRipple className={classes.actionArea} component={Link} to={`/${slug}`}>
          <Typography variant="h5" gutterBottom display="block">{title}</Typography>
        </CardActionArea>
          &nbsp;
          <Chip
            label={post.category}
            component={Link}
            to={`/category/${post.category}`}
            clickable
            className={classes.chip}
          />
          {publishedOn
            ? <Typography variant="caption" gutterBottom display="inline">
                {publishedOn}
              </Typography>
            : null
          }
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

  if (!gitContext.gitState?.index?.posts) return null;

  const sortedPosts = Object.values(gitContext.gitState?.index?.posts).sort((a,b) => {
    if ((!a.publishedOn && !b.publishedOn) || a.publishedOn === b.publishedOn) return 0;
    if (!a.publishedOn) return 1;
    if (!b.publishedOn) return -1;
    return a.publishedOn > b.publishedOn ? -1 : 1
  })

  const featured = sortedPosts.filter((post) => post.featured)

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
            All <em>{filterBy}</em> posts
          </Typography>
      }
      <Grid container spacing={3} justify={"space-around"} alignItems={"center"}>
        {sortedPosts.map((post: PostData) => {
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
