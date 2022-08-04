import { PostData } from "@bloggit/types";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBackIcon from "@mui/icons-material/NavigateBefore";

import React, { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link as RouterLink } from "react-router-dom";

import { GitContext } from "../GitContext";
import { PostsByCategory, SidebarNode } from "../types";
import { getChildValue, replaceEmojiString, emptySidebarNode, slugify } from "../utils";

import { HashLink } from "./HashLink";

const Root = styled("div")(({ theme }) => ({
  width: "100%"
}))

const TocGenerator = ({
  children,
  level,
  node,
}: {
  children: any[];
  level?: number;
  node: any;
}) => {
  const gitContext = useContext(GitContext);
  const { currentRef, slug } = gitContext.gitState;

  if (children?.length > 1) {
    console.warn("This heading has more than one child..?");
    return null;
  }
  const value = getChildValue(node);
  if (!value) {
    console.warn("This heading has no child values..?");
    return null;
  }
  const headingSlug = slugify(replaceEmojiString(value));
  const heading = replaceEmojiString(value);

  return (
    <>
      <ListItem
        button
        key={headingSlug}
        sx={{ width: "100%", paddingLeft: level || 1}}
        component={HashLink as any}
        to={`/${currentRef ? `${currentRef}/` : ""}${slug}#${headingSlug}`}
      >
        {heading}
      </ListItem>
    </>
  );
};

export const Toc = ({
  posts,
}: {
  posts: PostsByCategory;
}) => {
  const [node, setNode] = useState<SidebarNode>(emptySidebarNode);
  const gitContext = useContext(GitContext);

  const { currentContent, slug, index } = gitContext.gitState;

  const byTitle = (pA: PostData, pB: PostData): number =>
    (pA?.title || "").toLowerCase() > (pB?.title || "").toLowerCase() ? 1 : -1;

  useEffect(() => {
    // Update sidebar node
    if (slug !== "" && index?.posts?.[slug || ""]){
      setNode({ parent: "posts", current: "toc", value: index?.posts?.[slug || ""] });
    } else {
      setNode({ current: "categories" });
    }
  // ignore setNode dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, index]);

  switch(node.current) {
  case "categories": 
    return (
      <Root>
        <Box component="div" key={"categories"} textAlign="center" m={1}>
          <Typography>
            CATEGORIES
          </Typography>
        </Box>
        <List component="nav" sx={{ width: "100%" }}>
          {Object.keys(posts).sort().map((c) => {
            if (c !== "top-level") {
              return (
                <div key={c}>
                  <ListItem
                    button
                    onClick={() => setNode({ parent: "categories", current: "posts", value: c })}
                  >
                    {c}
                    <IconButton
                      onClick={() => setNode({
                        parent: "categories",
                        current: "posts", value: c
                      })}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </div>
              );
            } else {
              return null;
            }
          })}
        </List>
        {posts["top-level"]
          ? posts["top-level"].sort(byTitle).map((p) => {
            return (
              <Box component="div" key={p.slug} textAlign="center" m={1}>
                <Button
                  size="small"
                  disableFocusRipple={false}
                  component={RouterLink}
                  to={`/${p.slug}`}
                > {p.title} </Button>
              </Box>
            );})
          : null
        }
      </Root>
    );

  case "posts": 
    return (
      <Root>
        <IconButton
          onClick={() => setNode({ 
            current: "categories",
          })}
        >
          <NavigateBackIcon />
        </IconButton>
        <Box component="div" key={`post_category_${node.value}`} textAlign="center" m={1}>
          <Link color="textPrimary" component={RouterLink} to={`/category/${node.value}`}>
            {node.value.toUpperCase()} POSTS
          </Link>
        </Box>
        <Divider />
        <List component="nav" sx={{ width: "100%" }}>
          {posts[node.value]
            ? posts[node.value].sort(byTitle).map((p) => {
              return (
                <div key={p.slug}>
                  <ListItem button key={p.title} component={RouterLink} to={`/${p.slug}`} onClick={() =>
                    (slug === p.slug)
                      ? setNode({ parent: "posts", current: "toc", value: p })
                      : null
                  }
                  >
                    {p.title}
                  </ListItem>
                  <Divider />
                </div>
              );
            })
            : <div>
              <ListItem button> No published posts in this category </ListItem>
            </div>
          }
        </List>
        {posts["top-level"]
          ? posts["top-level"].sort(byTitle).map((p) => {
            return (
              <Box component="div" key={p.slug} textAlign="center" m={1}>
                <Button
                  size="small"
                  disableFocusRipple={false}
                  component={RouterLink}
                  to={`/${p.slug}`}
                > {p.title} </Button>
              </Box>
            );})
          : null
        }
      </Root>
    );

  case "toc":
    return (
      <Root>
        <IconButton
          onClick={() => {
            if (node.value.category) {
              setNode({ parent: "categories", current: "posts", value: node.value.category.toLowerCase() });
            } else {
              setNode({ current: "categories" });
            }
          }}
        >
          <NavigateBackIcon />
        </IconButton>
        <Box component="div" key={`post_${node.value.slug}`}
          sx={{
            textAlign: "center",
            m: "1"
          }}
        >
          <Typography>
            TABLE OF CONTENTS
          </Typography>
        </Box>
        <Divider />
        <List component="nav" sx={{ width: "100%" }}>
          <ReactMarkdown
            allowedElements={["h1", "h2", "h3", "h4", "h5", "h6"]}
            className={"Root"}
            components={{
              h1: TocGenerator,
              h2: TocGenerator,
              h3: TocGenerator,
              h4: TocGenerator,
              h5: TocGenerator,
              h6: TocGenerator,
            }}
          >
            {currentContent}
          </ReactMarkdown>
        </List>
        <Divider />
      </Root>
    );
  default:
    return null;
  }
};
