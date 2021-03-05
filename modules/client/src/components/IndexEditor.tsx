import React, { useContext, useEffect, useState } from "react";
import { 
  Divider,
  Table,
  TableRow,
  TableCell,
  TableHead,
  IconButton,
  Fab,
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
  editColumn: {
    width: "36px",
  },
  bottomSpace: {
    height: theme.spacing(10),
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

    <Divider variant="middle"/>

    <Table size="small">
      <TableHead>
        <TableRow> 
          <TableCell padding="none" className={classes.editColumn}></TableCell>
          <TableCell padding="none">Title</TableCell>
          <TableCell padding="checkbox">Featured</TableCell>
          <TableCell padding="checkbox">Draft</TableCell>
        </TableRow> 
      </TableHead>
      {newIndex?.posts
        ? Object.values(newIndex?.posts || {}).map((post) => {
          const slug = post?.slug || "";
          const title = post?.title || "";
          const draft = !!post?.draft;
          const featured = !!post?.featured;
          return (
            <TableRow>

              <TableCell padding="none" className={classes.editColumn}>
                <IconButton
                  onClick={() => {
                    setEditMode(true);
                    history.push(`/${slug}`);
                  }}
                  color="secondary"
                  size="small"
                ><Edit/></IconButton>
              </TableCell>

              <TableCell align="left" padding="none">
                {title}
              </TableCell>

              <TableCell align="center" padding="checkbox">
                <Switch
                  size="small"
                  checked={featured}
                  onChange={() => toggleFeatured(slug)}
                />
              </TableCell>

              <TableCell align="center" padding="checkbox">
                <Switch
                  size="small"
                  checked={draft}
                  onChange={() => toggleDraft(slug)}
                />
              </TableCell>

            </TableRow>
          )
        })
        : null
      }
    </Table>
    <div className={classes.bottomSpace}/>
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
