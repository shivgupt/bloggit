import React, { useContext, useEffect, useState } from "react";
import { 
  Divider,
  IconButton,
  Fab,
  FormControlLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Switch,
  TextField,
  Theme,
} from "@material-ui/core";
import { Add, Edit, Save } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
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

  const oldIndex = gitContext.gitState?.index;

  const toggleFeatured = (slug: string): void => {
    const nextIndex = JSON.parse(JSON.stringify(newIndex));
    nextIndex.posts[slug].featured = !nextIndex.posts[slug].draft && !newIndex.posts[slug].featured;
    setNewIndex(nextIndex);
  }

  const toggleDraft = (slug: string): void => {
    const nextIndex = JSON.parse(JSON.stringify(newIndex));
    nextIndex.posts[slug].draft = !newIndex.posts[slug].draft;
    nextIndex.posts[slug].featured = !nextIndex.posts[slug].draft && newIndex.posts[slug].featured;
    setNewIndex(nextIndex);
  }

  useEffect(() => {
    setNewIndex(oldIndex);
  }, [oldIndex]);

  useEffect(() => {
    if (!oldIndex?.title || !newIndex?.title) return;
    if (
      oldIndex.title !== newIndex.title ||
      Object.values(newIndex.posts).some(post => {
        const oldEntry = oldIndex.posts[post.slug];
        return !!post.featured !== !!oldEntry.featured || !!post.draft !== !!oldEntry.draft;
      })
    ) {
      console.log(`The new index is different than the old one`);
      setDiff(true);
    } else {
      console.log(`The new index is the same as the old one`);
      setDiff(false);
    }
  }, [newIndex, oldIndex]);

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
          onChange={(event) => {
            setNewIndex(prevIndex => ({ ...prevIndex, title: event.target.value }));
          }}
          required={true}
          value={title}
        />
      </ListItem>
      <Divider variant="middle"/>
      <List>
      <ListItem key="index-titles" alignItems="flex-start">
      title featured drafts edit
      </ListItem>
      {newIndex?.posts
        ? Object.values(newIndex?.posts || {}).map((post) => {
          const slug = post?.slug || "";
          const title = post?.title || "";
          const draft = !!post?.draft;
          const featured = !!post?.featured;
          return (
            <ListItem key={slug} alignItems="flex-start">
              <ListItemText primary={title} className={classes.listText} />

              <FormControlLabel
                id={`toggle-${slug}-featured`}
                control={
                  <Switch
                    size="small"
                    checked={featured}
                    onChange={() => toggleFeatured(slug)}
                  />
                }
                label="Featured"
                labelPlacement="top"
              />

              <FormControlLabel
                id={`toggle-${slug}-draft`}
                control={
                  <Switch
                    size="small"
                    checked={draft}
                    onChange={() => toggleDraft(slug)}
                  />
                }
                label="Draft"
                labelPlacement="top"
              />

              <ListItemSecondaryAction>
                <IconButton size="small"
                  onClick={() => {
                    setEditMode(true);
                    history.push(`/${slug}`);
                  }}
                  color="secondary"
                ><Edit/></IconButton>
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
