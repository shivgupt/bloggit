import { BlogIndex, PostData } from "@blog/types";
import React, { useContext, useEffect, useState } from "react";
import { 
  Divider,
  Table,
  Checkbox,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
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

type EditIndex = BlogIndex & {
  posts: {
    [slug: string] : PostData & {
      removed?: boolean;
    };
  };
};

export const IndexEditor = (props: {
  setEditMode: (editMode: boolean) => void;
}) => {
  const { setEditMode } = props;
  const [diff, setDiff] = useState(false);
  const [newIndex, setNewIndex] = useState(emptyIndex as EditIndex);
  const classes = useStyles();
  const gitContext = useContext(GitContext);
  const history = useHistory();

  const oldIndex = gitContext.gitState?.index;

  const toggleFeatured = (slug: string): void => {
    const nextIndex = JSON.parse(JSON.stringify(newIndex)) as EditIndex;
    nextIndex.posts[slug].featured = !nextIndex.posts[slug].draft && !newIndex.posts[slug].featured;
    setNewIndex(nextIndex);
  }

  const toggleDraft = (slug: string): void => {
    const nextIndex = JSON.parse(JSON.stringify(newIndex)) as EditIndex;
    nextIndex.posts[slug].draft = !newIndex.posts[slug].removed && !newIndex.posts[slug].draft;
    nextIndex.posts[slug].featured = !nextIndex.posts[slug].draft && newIndex.posts[slug].featured;
    setNewIndex(nextIndex);
  }

  const toggleRemoved = (slug: string): void => {
    const nextIndex = JSON.parse(JSON.stringify(newIndex)) as EditIndex;
    nextIndex.posts[slug].removed = !newIndex.posts[slug].removed;
    nextIndex.posts[slug].draft = false;
    nextIndex.posts[slug].featured = false;
    setNewIndex(nextIndex);
  }

  useEffect(() => {
    setNewIndex(oldIndex as EditIndex);
  }, [oldIndex]);

  useEffect(() => {
    if (!oldIndex?.title || !newIndex?.title) return;
    if (
      oldIndex.title !== newIndex.title ||
      Object.values(newIndex.posts).some(post => {
        const oldEntry = oldIndex.posts[post.slug];
        return !!post.removed
          || !!post.featured !== !!oldEntry.featured
          || !!post.draft !== !!oldEntry.draft;
      })
    ) {
      setDiff(true);
    } else {
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
    const indexToSave = JSON.parse(JSON.stringify(newIndex)) as EditIndex;
    Object.keys(indexToSave.posts).forEach(slug => {
      if (indexToSave.posts[slug].removed) {
        console.log(`Removing ${slug} from index`);
        delete indexToSave.posts[slug];
      }
    });
    await axios({
      method: "post",
      url: "git/edit",
      headers: { "content-type": "application/json" },
      data: [{ path: "index.json", content: JSON.stringify(indexToSave, null, 2) }],
    });
    await gitContext.syncGitState(undefined, undefined, true);
  };

  const title = newIndex?.title;
  return (<>
    <TextField
      autoComplete={"off"}
      error={!title}
      helperText={!title ? "Please provide a title" : ""}
      id="edit-index-title"
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
          <TableCell padding="checkbox">Remove</TableCell>
        </TableRow> 
      </TableHead>
      <TableBody>
        {newIndex?.posts
          ? Object.values(newIndex?.posts || {}).map((post) => {
            const slug = post?.slug || "";
            const title = post?.title || "";
            const draft = !!post?.draft;
            const featured = !!post?.featured;
            const removed = !!post?.removed;
            return (
              <TableRow id={`table-row-${slug}`} key={`table-row-${slug}`}>

                <TableCell padding="none" className={classes.editColumn}>
                  <IconButton
                    id={`edit-${slug}`}
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
                    id={`toggle-featured-${slug}`}
                    size="small"
                    checked={featured}
                    onChange={() => toggleFeatured(slug)}
                  />
                </TableCell>

                <TableCell align="center" padding="checkbox">
                  <Switch
                    id={`toggle-draft-${slug}`}
                    size="small"
                    checked={draft}
                    onChange={() => toggleDraft(slug)}
                  />
                </TableCell>

                <TableCell align="center" padding="checkbox">
                  <Checkbox
                    id={`toggle-remove-${slug}`}
                    size="small"
                    checked={removed}
                    onChange={() => toggleRemoved(slug)}
                  />
                </TableCell>

              </TableRow>
            )
          })
          : null
        }
      </TableBody>
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
