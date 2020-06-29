import React, { useState } from "react";

import {
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Edit as EditIcon,
} from "@material-ui/icons";

import { ProfileEdit } from "./ProfileEdit";
import { FoodLog } from "./FoodLog";
import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  const [dialog, setDialog] = useState(false);

  const handleEditProfile = (event: React.ChangeEvent<{ value: any, id: string }>) => {
    const newProfile = { ...profile, [event.target.id]: event.target.value };
    setProfile(newProfile);
  };

  const handleProfileSave = () => store.save("FitnessProfile", profile);

  const toggleProfileDialog = () => setDialog(!dialog);

  return (
    <>
      <Typography>
        Hello {profile.name || "Stranger"}!
        <IconButton onClick={toggleProfileDialog}>
          <EditIcon />
        </IconButton>
      </Typography>
      <ProfileEdit
        dialog={dialog}
        profile={profile}
        handleEditProfile={handleEditProfile}
        handleProfileSave={handleProfileSave}
        toggleProfileDialog={toggleProfileDialog}
      />
      <FoodLog foodLog={profile.foodLog} />
    </>
  );
};
