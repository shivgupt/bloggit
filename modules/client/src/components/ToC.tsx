import React from "react";
import Markdown from "react-markdown";
import { Link } from "react-router-dom";
import {
  makeStyles,
  Divider,
  IconButton,
  List,
  ListItem,
} from "@material-ui/core";
import {
  Toc as TocIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBackIos as NavigateBackIcon,
} from "@material-ui/icons";
import emoji from "emoji-dictionary";

import { getChildValue } from "../utils";

import { HashLink } from "./HashLink";

const useStyles = makeStyles(theme => ({
  list: { width: "100%" },
  list1: { width: "100%", "paddingLeft": theme.spacing(2) },
  list2: { width: "100%", "paddingLeft": theme.spacing(4) },
  list3: { width: "100%", "paddingLeft": theme.spacing(6) },
  list4: { width: "100%", "paddingLeft": theme.spacing(8) },
  list5: { width: "100%", "paddingLeft": theme.spacing(10) },
  tocIcon: {
    marginLeft: theme.spacing(2),
  },
}));

const TocGenerator = (props: any) => {
  const classes = useStyles();
  if (props.children.length > 1) {
    console.warn("This heading has more than one child..?");
    return null;
  }
  const value = getChildValue(props.children[0]);
  if (!value) {
    console.warn("This heading has no child values..?");
    return null;
  }
  const headingSlug = value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\W+/g, "-");
  const heading = value.replace(/:\w+:/gi, name => emoji.getUnicode(name) || name);

  const marginStyle = classes[`list${props.level || 1}`];
  return (
    <>
      <ListItem
        button
        key={headingSlug}
        className={marginStyle}
        component={HashLink as any}
        to={{ hash:`#${headingSlug}` }}
      >
        {heading}
      </ListItem>
      <Divider />
    </>
  );
};

export const Toc = (props: any) => {
  const { node, allContent, posts, gitRef: ref, setNode } = props;
  const classes = useStyles();

  switch(node.current) {
  case "categories": 
    return (
      <div className={classes.list}>
        <List component="nav" className={classes.list}>
          {Object.keys(posts).map((c) => {
            if (c !== "top-level") {
              return (
                <div key={c}>
                  <ListItem
                    button
                    onClick={() => setNode({ parent: "categories", current: "posts", child: c })}
                  >
                    {c}
                    <IconButton
                      onClick={() => setNode({
                        parent: "categories",
                        current: "posts", child: c
                      })}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </div>
              );
            }
          })}
        </List>
      </div>
    );

  case "posts": 
    return (
      <div className={classes.list}>
        <IconButton
          onClick={() => setNode({ 
            parent: null,
            current: "categories",
            child: "posts",
          })}
        >
          <NavigateBackIcon />
        </IconButton>
        <Divider />
        <List component="nav" className={classes.list}>
          {posts[node.child].map((p) => {
            return (
              <div key={p.slug}>
                <ListItem button key={p.title} component={Link} to={`/${p.slug}`} onClick={() =>
                  setNode({
                    parent: "posts",
                    current: "toc",
                    child: p,
                  })}
                >
                  {p.title}
                  {allContent && allContent[ref] && allContent[ref][p.slug]
                    ? <TocIcon className={classes.tocIcon} />
                    : null
                  }
                </ListItem>
                <Divider />
              </div>
            );
          })}
        </List>
      </div>
    );

  case "toc":
    return (
      <div className={classes.list}>
        <IconButton
          onClick={() => {
            if (node.child.category) {
              setNode({ parent: "categories", current: "posts", child: node.child.category })
            } else {
              setNode({ parent: null, current: "categories", child: "posts" })
            }
          }}
        >
          <NavigateBackIcon />
        </IconButton>
        <Divider />
        <List component="nav" className={classes.list}>
          <Markdown
            allowedTypes={["text", "heading"]}
            source={allContent[ref] ? allContent[ref][node.child.slug] : ""}
            renderers={{ heading: TocGenerator }}
            className={classes.list}
          />
        </List>
      </div>
    );
  default:
    return <div> Hello </div>;
  }
};
