import { BlogIndex, EditRequest, PostData } from "@blog/types";
import Backdrop from "@material-ui/core/Backdrop";
import Checkbox from "@material-ui/core/Checkbox";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Fab from "@material-ui/core/Fab";
import IconButton from "@material-ui/core/IconButton";
import Switch from "@material-ui/core/Switch";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Add from "@material-ui/icons/Add";
import Edit from "@material-ui/icons/Edit";
import Save from "@material-ui/icons/Save";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";
import { emptyIndex, getPath } from "../utils";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  editColumn: {
    width: "36px",
  },
  bottomSpace: {
    height: theme.spacing(10),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
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

export const IndexEditor = () => {
  const [diff, setDiff] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [newIndex, setNewIndex] = useState<EditIndex>(emptyIndex);
  const gitContext = useContext(GitContext);
  const history = useHistory();
  const classes = useStyles();

  const oldIndex = gitContext.gitState?.index;
  const title = newIndex?.title;

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
          || !!post?.featured !== !!oldEntry?.featured
          || !!post?.draft !== !!oldEntry?.draft;
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
    setSaving(true);
    const indexToSave = JSON.parse(JSON.stringify(newIndex)) as EditIndex;
    const editRequest = [] as EditRequest;
    Object.keys(indexToSave.posts).forEach(slug => {
      if (indexToSave.posts[slug].removed) {
        const oldPath = getPath(indexToSave.posts[slug])
        if (oldPath) {
          console.log(`Removing ${oldPath} from git repo`);
          editRequest.push({ path: oldPath!, content: "" });
        }
        console.log(`Removing ${slug} from index`);
        delete indexToSave.posts[slug];
      }
    });
    editRequest.push({ path: "index.json", content: JSON.stringify(indexToSave, null, 2) });
    await axios({
      method: "post",
      url: "/git/edit",
      headers: { "content-type": "application/json" },
      data: editRequest,
    });
    await gitContext.syncGitState(undefined, undefined, true);
    setSaving(false);
  };

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
                      history.push(`/admin/edit/${slug}`);
                    }}
                    color="secondary"
                    size="small"
                  ><Edit/></IconButton>
                </TableCell>

                <TableCell align="left" padding="none" onClick={() => {
                  history.push(`/${slug}`)
                }}>
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
          history.push("/admin/create");
        }
      }}
    >{(diff ? <Save/> : <Add/>)}</Fab>
    <Backdrop className={classes.backdrop} open={saving}>
      <CircularProgress color="inherit" />
    </Backdrop>
  </>);
};
