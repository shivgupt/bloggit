import React, { useContext, useEffect, useState } from "react";
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
  Fab,
} from "@material-ui/core";
import { Add, Save } from "@material-ui/icons";
import { Link, useHistory } from "react-router-dom";
import { Drafts, Public } from "@material-ui/icons";
import axios from "axios";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";
import { emptyIndex } from "../utils";

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
  fab: getFabStyle(theme),
}));


export const IndexEditor = (props: {
  setEditMode: (editMode: boolean) => void;
}) => {
  const { setEditMode } = props;
  const [diff, setDiff] = useState(false);
  const [newIndex, setNewIndex] = useState(emptyIndex);
  const classes = useStyles();
  const gitContext = useContext(GitContext);
  const history = useHistory();

  const index = gitContext.gitState?.index;

  const handleChange = (key: string, val: boolean | string, slug?: string): void => {
    if (slug) {
      const oldEntry = newIndex[slug] || {}
      setNewIndex(oldIndex => ({ ...oldIndex, slug: { ...oldEntry, [key]: val } }));
    } else {
      setNewIndex(oldIndex => ({ ...oldIndex, [key]: val }));
    }
  };

  useEffect(() => {
    setNewIndex(index);
  }, [index]);

  useEffect(() => {
    if (!index?.title || !newIndex?.title) return;
    if (JSON.stringify(index) !== JSON.stringify(newIndex)) {
      console.log(`The new index is different than the old one`);
      setDiff(true);
    }
  }, [newIndex, index]);

  const saveChanges = async (): Promise<void> => {
    if (!diff) {
      console.warn(`No changes to save`);
      return;
    }
    if (!newIndex?.title) {
      console.warn(`Invalid index`);
      return;
    }
    await axios({
      method: "post",
      url: "git/edit",
      headers: { "content-type": "application/json" },
      data: [{ path: "index.json", content: JSON.stringify(newIndex, null, 2) }],
    });
    await gitContext.syncGitState(undefined, undefined, true);
  };

  const title = newIndex?.title;
  return (<>
    <List className={classes.root}>
      <ListItem key="index_title">
        <TextField
          autoComplete={"off"}
          error={!title}
          helperText={!title ? "Please provide a title" : ""}
          id="input-index-title"
          key="index-title"
          label="index-title"
          name="index-title"
          onChange={(event) => handleChange("title", event.target.value)}
          required={true}
          value={title}
        />
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
                      onClick={() => handleChange("draft", false, post.slug)}
                      color="primary"
                      variant="contained"
                      startIcon={<Public />}
                    >
                      Publish
                    </Button>
                  : <Button
                      onClick={() => handleChange("draft", true, post.slug)}
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
    <Fab
      id={"fab"}
      className={classes.fab}
      color="primary"
      onClick={() => {
        if (diff) {
          console.log("Saving changes..");
          saveChanges();
        } else {
          console.log("Creating new post..");
          setEditMode(true);
          history.push("/");
        }
      }}
    >{(diff ? <Save/> : <Add/>)}</Fab>

  </>);
};
