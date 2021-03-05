import React, { useContext } from "react";
import { 
  Button,
  Divider,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { Drafts, Public } from "@material-ui/icons";
import axios from "axios";

import { GitContext } from "../GitContext";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  listText: {
    maxWidth: "60%"
  },
  section: {
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
}));


export const IndexEditor = () => {

  const gitContext = useContext(GitContext);
  const index = gitContext.gitState?.index;

  const classes = useStyles();

  const handleArchive = async (slug: string) => {
    if (!index) return;
    const newIndex = JSON.parse(JSON.stringify(index));
    newIndex.posts[slug].draft = true;
    await axios({
      method: "post",
      url: "git/edit",
      data: [
      {
        path: "index.json",
        content: JSON.stringify(newIndex, null, 2),
      }
    ],
      headers: { "content-type": "application/json" }
    });
    await gitContext.syncGitState(undefined, undefined, true);
  };

  const handlePublish = async (slug: string) => {
    if (!index) return;
    const newIndex = JSON.parse(JSON.stringify(index));
    newIndex.posts[slug].draft = false;
    await axios({
      method: "post",
      url: "git/edit",
      data: [
      {
        path: "index.json",
        content: JSON.stringify(newIndex, null, 2),
      }
    ],
      headers: { "content-type": "application/json" }
    });
    await gitContext.syncGitState(undefined, undefined, true);
  };

  return (
    <List className={classes.root}>
      <ListItem key="index_title">
        <TextField id="index_title" label="title" defaultValue={index?.title} />
      </ListItem>
      <Divider variant="middle"/>
      <List>
      {index?.posts
        ? Object.values(index?.posts || []).map((post) => {
          return (
            <ListItem button component={Link} to={`/${post.slug}`} key={post.slug} alignItems="flex-start">
              <ListItemText primary={post.title} className={classes.listText} />
              <ListItemSecondaryAction>
                {post.draft
                  ? <Button size="small"
                      onClick={() => handlePublish(post.slug)}
                      color="primary"
                      variant="contained"
                      startIcon={<Public />}
                    >
                      Publish
                    </Button>
                  : <Button
                      onClick={() => handleArchive(post.slug)}
                      size="small"
                      color="primary"
                      variant="contained"
                      startIcon={<Drafts />}
                    >
                      Archive
                    </Button>
                }
              </ListItemSecondaryAction>
            </ListItem>
          )
        })
        : null
      }
      </List>
    </List>
  );
};
