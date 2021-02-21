import React, { useContext, useEffect, useState } from "react";
import { 
  Button,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import { AdminContext } from "../AdminContext";
import { Drafts, ExpandLess, ExpandMore, Public } from "@material-ui/icons";
import axios from "axios";

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


export const IndexEditor = (props: any) => {

const adminContext = useContext(AdminContext);
const [index, setIndex] = useState(adminContext.index);
const [openPosts, setOpenPosts] = useState(false);
const [openDrafts, setOpenDrafts] = useState(false);

const classes = useStyles();
const togglePosts = () => setOpenPosts(!openPosts);
const toggleDrafts = () => setOpenDrafts(!openDrafts);

useEffect(() => setIndex(adminContext.index), [adminContext.index]);

const handleArchive = async (slug: string) => {
  const newIndex = JSON.parse(JSON.stringify(index));

  newIndex.drafts[slug] = index.posts[slug];
  delete newIndex.posts[slug];

  let res = await axios({
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

  adminContext.syncRef();
};

const handlePublish = async (slug: string) => {
  const newIndex = JSON.parse(JSON.stringify(index));

  newIndex.posts[slug] = index.drafts![slug];
  delete newIndex.drafts[slug];

  let res = await axios({
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

  adminContext.syncRef();
};

return (
  <List className={classes.root}>
    <ListItem key="index_title">
      <TextField id="index_title" label="title" defaultValue={index.title} />
    </ListItem>
    <ListItem key="index_posts">
      <ListItemText primary="Posts" onClick={togglePosts} />
      {openPosts ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
    <Collapse in={openPosts} timeout="auto" unmountOnExit>
      <List>
      {Object.values(index.posts).map((post) => {
        return (
          <ListItem button component={Link} to={`/${post.slug}`} key={post.slug} alignItems="flex-start">
            <ListItemText primary={post.title} className={classes.listText} />
            <ListItemSecondaryAction>
              <Button
                onClick={() => handleArchive(post.slug)}
                size="small"
                color="primary"
                variant="contained"
                startIcon={<Drafts />}
              >
                Archive
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        )
      })}
      </List>
    </Collapse> 
    <ListItem key="index_drafts">
      <ListItemText primary="Drafts" onClick={toggleDrafts} />
      {openDrafts ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
    <Collapse in={openDrafts} timeout="auto" unmountOnExit>
      <List>
      {index.drafts
       ? Object.values(index.drafts).map((draft) => {
          return (
            <ListItem button component={Link} to={`/${draft.slug}`} key={draft.slug} alignItems="flex-start">
              <ListItemText primary={draft.title} className={classes.listText} />
              <ListItemSecondaryAction>
                <Button size="small"
                  onClick={() => handlePublish(draft.slug)}
                  color="primary"
                  variant="contained"
                  startIcon={<Public />}
                >
                  Publish
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })
        : null
      }
      </List>
    </Collapse> 
  </List>
  );
}
