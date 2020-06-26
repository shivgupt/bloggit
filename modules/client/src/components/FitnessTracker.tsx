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

import { ProfileEdit } from "./ProfileEdit";
import { FoodLog } from "./FoodLog";
import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

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
          <ProfileEdit profile={profile} handleEditProfile={handleEditProfile} />
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
      <FoodLog foodLog={profile.foodLog} />
    </>
  )
}
