import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  AccountCircle as ProfileIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  SaveAlt as SaveIcon,
} from "@material-ui/icons";

import { store } from "../utils/cache";

export const Profile = (props: any) => {
  const { profile, setProfile } = props;

  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const handleEditProfile = (event: React.ChangeEvent<{ value: any, id: string }>) => {
    const newProfile = { ...profile, [event.target.id]: event.target.value };
    setProfile(newProfile);
  };
  const toggleProfileDialog = () => setOpenProfileDialog(!openProfileDialog);

  return (
    <>
      <IconButton onClick={toggleProfileDialog}> <ProfileIcon /> </IconButton>
      
      <Dialog open={openProfileDialog} onClose={toggleProfileDialog}>
        <DialogContent>
          <Typography display="inline">
            Hello {profile.name || "Stranger"}!
          </Typography>
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
            defaultValue={profile.age || "25"}
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
          <IconButton onClick={() => store.save("FitnessProfile", profile)}>
            <SaveIcon />
          </IconButton>
          <IconButton onClick={toggleProfileDialog}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

