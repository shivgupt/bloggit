import { PostData } from "@bloggit/types";
import Card from "@mui/material/Card";
import Fab from "@mui/material/Fab";
import Hidden from "@mui/material/Hidden";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/material/styles";
import Add from "@mui/icons-material/Add";
import React, { useContext } from "react";
import Carousel from "react-material-ui-carousel";
import { useNavigate, Link } from "react-router-dom";
import { styled } from "@mui/material/styles";

import { getFabStyle } from "../style";
import { getPrettyDateString, replaceEmojiString } from "../utils";
import { GitContext } from "../GitContext";

// TODO: align grid item for small screen
// justify={idx % 2 === 0 ? "flex-end" : "flex-start"}
const StyledGrid = styled(Grid)(({ theme }) => ({
    display: "flex",
    alignContent: "center",
    alignItems: "center",
}));

const StyledDiv = styled("div")(({ theme }) => ({
  width: "100%",
  height: "210px",
}))

const StyledCardImg = styled("img")(( { theme }) => ({
  height: "auto",
  maxWidth: "100%",
}));

export const PostCard = ({
  post,
}: {
  post: PostData,
}) => {
  const slug = post.slug;
  const title = replaceEmojiString(post.title);
  const tldr = replaceEmojiString(post.tldr!);
  const cutoff = post.img ? 140 : 280;
  const publishedOn = post.publishedOn ? getPrettyDateString(post.publishedOn) : null;

  return (
    <Card sx={{ width: "100%", maxWidth: "420px", height: "420px" }}>
      <CardActionArea disableRipple
        sx={{ width: "100%" }}
        component={Link} to={`/${slug}`}>
        {post.img
          ? <StyledDiv>
            <StyledCardImg
              src={post.img}
              alt={slug}
            />
          </StyledDiv>
          : null}
      </CardActionArea>
      <CardContent
        sx={{
          backgroundColor: (theme) => theme.palette.mode === "light"
            ? "rgba(256, 256, 256, 0.90)"
            : "rgba(66,  66,  66,  0.90)",
          opacity: "0.99",
          height: "420px",
        }}
      >
        <CardActionArea disableRipple
          sx={{ width: "100%" }}
          component={Link} to={`/${slug}`}>
          <Typography variant="h5" gutterBottom display="block">{title}</Typography>
        </CardActionArea>
          &nbsp;
        <Chip
          label={post.category}
          component={Link}
          to={`/category/${post.category}`}
          clickable
          sx={{ mr: 1 }}
        />
        {publishedOn
          ? <Typography variant="caption" gutterBottom display="inline">
            {publishedOn}
          </Typography>
          : null
        }
        <CardActionArea disableRipple
          sx={{ width: "100%", height: "210px" }}
          component={Link}
          to={`/${slug}`}
        >
          <Typography variant="caption" component="p" gutterBottom
            sx={{
              mt: 1,
              mr: 1,
              alignContent: "center",
              alignItems: "center",
            }}
            >
            {tldr.substr(0,cutoff)} {tldr.length > cutoff ? "..." : null}
          </Typography>
        </CardActionArea>
      </CardContent>
    </Card>
  );
};

export const Home = ({
  adminMode,
  filterBy,
}: {
  adminMode: string;
  filterBy?: string,
 }) => {
  const gitContext = useContext(GitContext);
  const navigate = useNavigate();

  if (!gitContext.gitState?.index?.posts) return null;

  const sortedPosts = Object.values(gitContext.gitState?.index?.posts).sort((a,b) => {
    if ((!a.publishedOn && !b.publishedOn) || a.publishedOn === b.publishedOn) return 0;
    if (!a.publishedOn) return 1;
    if (!b.publishedOn) return -1;
    return a.publishedOn > b.publishedOn ? -1 : 1;
  });

  const featured = sortedPosts.filter((post) => post.featured);

  return (
    <>
      {!filterBy
        ? <>
          <Carousel 
            sx={{
              mt: 1,
              mr: 2,
              width: "100%",
              maxWidth: "420px",
            }}
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
          <Typography variant="h4"
            sx={{
              margin: 1,
              alignContent: "center",
              alignItems: "center",
            }}>
              Archives
          </Typography>
        </>
        : <Typography variant="h4"
            sx={{
              mt: 1,
              mr: 1,
              alignContent: "center",
              alignItems: "center",
            }}>
            All <em>{filterBy}</em> posts
        </Typography>
      }
      <Grid
        container
        spacing={3}
      >
        {sortedPosts.filter((post: PostData) => {
          if (!post.category || post.draft) return false;
          if (!filterBy && post.featured) return false;
          if (filterBy && post.category !== filterBy) return false;
          return true;
        }).map((post: PostData, idx: number) => (
          <React.Fragment key={idx}>
            <Hidden mdUp>
              <StyledGrid
                item
                key={post.slug}
                sm={12}
                xs={12}
              >
                <PostCard post={post} />
              </StyledGrid>
            </Hidden>
            <Hidden smDown>
              <StyledGrid
                item
                key={post.slug}
                md={6}
              >
                <PostCard post={post} />
              </StyledGrid>
            </Hidden>
          </React.Fragment>
        ))}
      </Grid>
      {adminMode === "enabled"
        ? <Fab
          id={"fab"}
          sx={ (theme) => getFabStyle(theme) }
          color="primary"
          onClick={() => {
            navigate("/admin/create");
          }}
        ><Add/></Fab>
        : null
      }
    </>
  );
};
