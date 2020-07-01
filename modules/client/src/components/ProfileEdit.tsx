import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  SaveAlt as SaveIcon,
} from "@material-ui/icons";

export const ProfileEdit = (props: any) => {
  const {
    open,
    profile,
    handleProfileSave,
    setProfile,
    toggleProfileDialog,
  } = props;

  const handleEditProfile = (event: React.ChangeEvent<{ value: any, id: string }>) => {
    const newProfile = { ...profile, [event.target.id]: event.target.value };
    setProfile(newProfile);
  };

  return (
    <Dialog open={open} onClose={toggleProfileDialog}>
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
        <IconButton onClick={handleProfileSave}>
          <SaveIcon />
        </IconButton>
        <IconButton onClick={toggleProfileDialog}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};
