import { BlogIndex, EditRequest, PostData } from "@bloggit/types";
import Backdrop from "@mui/material/Backdrop";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Save from "@mui/icons-material/Save";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";
import { emptyIndex, getPath } from "../utils";

const StyledDiv = styled("div")(({ theme }) => ({
  height: theme.spacing(10),
}))

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
  const navigate = useNavigate();

  const oldIndex = gitContext.gitState?.index;
  const title = newIndex?.title;

  const toggleFeatured = (slug: string): void => {
    const nextIndex = JSON.parse(JSON.stringify(newIndex)) as EditIndex;
    nextIndex.posts[slug].featured = !nextIndex.posts[slug].draft && !newIndex.posts[slug].featured;
    setNewIndex(nextIndex);
  };

  const toggleDraft = (slug: string): void => {
    const nextIndex = JSON.parse(JSON.stringify(newIndex)) as EditIndex;
    nextIndex.posts[slug].draft = !newIndex.posts[slug].removed && !newIndex.posts[slug].draft;
    nextIndex.posts[slug].featured = !nextIndex.posts[slug].draft && newIndex.posts[slug].featured;
    setNewIndex(nextIndex);
  };

  const toggleRemoved = (slug: string): void => {
    const nextIndex = JSON.parse(JSON.stringify(newIndex)) as EditIndex;
    nextIndex.posts[slug].removed = !newIndex.posts[slug].removed;
    nextIndex.posts[slug].draft = false;
    nextIndex.posts[slug].featured = false;
    setNewIndex(nextIndex);
  };

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
        const oldPath = getPath(indexToSave.posts[slug]);
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
          <TableCell padding="none" sx={{ width: "36px" }}></TableCell>
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

                <TableCell padding="none" sx={{ width: "36px" }}>
                  <IconButton
                    id={`edit-${slug}`}
                    onClick={() => {
                      navigate(`/admin/edit/${slug}`);
                    }}
                    color="secondary"
                    size="small"
                  ><Edit/></IconButton>
                </TableCell>

                <TableCell align="left" padding="none" onClick={() => {
                  navigate(`/${slug}`);
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
            );
          })
          : null
        }
      </TableBody>
    </Table>
    <StyledDiv />

    <Fab
      id={"fab"}
      sx={ (theme) => getFabStyle(theme) }
      color="primary"
      onClick={() => {
        if (diff) {
          console.log("Saving changes..");
          saveChanges();
        } else {
          console.log("Creating new post..");
          navigate("/admin/create");
        }
      }}
    >{(diff ? <Save/> : <Add/>)}</Fab>
    <Backdrop open={saving}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: "#fff"
      }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  </>);
};
