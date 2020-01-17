import React from "react";
import Markdown from "react-markdown";
import { getChildValue } from "../utils";
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

const useStyles = makeStyles(theme => ({
  list: {
    width: "100%",
  },
  tocButton: {
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

  let headingSlug = value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\W+/g, "-");

  return (
    <>
      <ListItem
        button
        key={headingSlug}
        className={classes.list}
        component={Link}
        to={{ hash:`#${headingSlug}` }}
      >
        {value}
      </ListItem>
      <Divider />
    </>
  );
};

export const Toc = (props: any) => {
  const { posts, setNode, node } = props;
  const classes = useStyles();

  switch(node.current) {
  case "categories": 
    return (
      <div className={classes.list}>
        <List component="nav" className={classes.list}>
          {Object.keys(posts).map((c) => {
            return (
              <>
                <ListItem>
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
              </>
            );
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
              <>
                <ListItem key={p.title} component={Link} to={`/post/${p.slug}`}>
                  {p.title}
                  {p.content ? 
                    <IconButton
                      onClick={() => setNode({
                        parent: "posts",
                        current: "toc",
                        child: p,
                      })}
                      className={classes.tocButton}
                    >
                      <TocIcon/>
                    </IconButton>
                    : null
                  }
                </ListItem>
                <Divider />
              </>
            );
          })}
        </List>
      </div>
    );

  case "toc":
    return (
      <div className={classes.list}>
        <IconButton
          onClick={() => setNode({
            parent: "categories",
            current: "posts",
            child: node.child.category,
          })}
        >
          <NavigateBackIcon />
        </IconButton>
        <Divider />
        <List component="nav" className={classes.list}>
          <Markdown
            allowedTypes={["text", "heading"]}
            source={node.child.content}
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
