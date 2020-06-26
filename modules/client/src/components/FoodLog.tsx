import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  SaveAlt as SaveIcon,
} from "@material-ui/icons";

import { store } from "../utils/cache";

export const FoodLog = (props: any) => {

  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  const [open, setOpen] = useState(false);

  const handleProfileDialog = (dialogState: boolean) => setOpen(dialogState);
  const handleProfileSave = () => store.save("FitnessProfile", profile);
  const handleEditProfile = (event: React.ChangeEvent<{ value: any, id: string }>) => {
    //console.log(event.target.id);
    const newProfile = {...profile, [event.target.id]: event.target.value}
    setProfile(newProfile);
  }

  return (
    <>
      <Typography>
        Hello {profile.name || "Stranger"}!
        <IconButton onClick={() => handleProfileDialog(true)}>
          <EditIcon />
        </IconButton>
      </Typography>
      <Dialog open={open} onClose={() => handleProfileDialog(false)}>
        <DialogContent>
          <TextField
            id="name"
            label="Profile Name"
            defaultValue={profile.name || "Stranger"}
            onChange={handleEditProfile}
            margin="normal"
            variant="outlined"
          />
          <TextField
            id="age"
            label="Age"
            defaultValue={profile.age || "0"}
            onChange={handleEditProfile}
            margin="normal"
            variant="outlined"
          />
          <TextField
            id="height"
            label="Height"
            defaultValue={profile.height || "5ft"}
            onChange={handleEditProfile}
            margin="normal"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <IconButton onClick={handleProfileSave}>
            <SaveIcon />
          </IconButton>
          <IconButton onClick={() => handleProfileDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
