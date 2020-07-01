import React, { useState } from "react";

import {
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Edit as EditIcon,
  AddCircle as AddIcon,
} from "@material-ui/icons";

import { AddMeal } from "./AddMeal";
import { ProfileEdit } from "./ProfileEdit";
import { FoodLog } from "./FoodLog";

import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openMealDialog, setOpenMealDialog] = useState(false);

  const handleProfileSave = () => store.save("FitnessProfile", profile);
  const toggleProfileDialog = () => setOpenProfileDialog(!openProfileDialog);
  const toggleMealDialog = () => setOpenMealDialog(!openMealDialog);

  const today = new Date();

  console.log(profile);
  return (
    <>
      <Typography> {today.toDateString()} </Typography>

      <Typography display="inline">
        Hello {profile.name || "Stranger"}!
      </Typography>
      <IconButton onClick={toggleProfileDialog}>
        <EditIcon />
      </IconButton>
      <ProfileEdit
        open={openProfileDialog}
        profile={profile}
        handleProfileSave={handleProfileSave}
        setProfile={setProfile}
        toggleProfileDialog={toggleProfileDialog}
      />

      <FoodLog
        foodLog={profile.foodLog}
        handleProfileSave={handleProfileSave}
      />

      <Typography display="inline">
        Add new Meal entry
      </Typography>
      <IconButton onClick={toggleMealDialog}>
        <AddIcon />
      </IconButton>
      <AddMeal
        open={openMealDialog}
        profile={profile}
        handleProfileSave={handleProfileSave}
        setProfile={setProfile}
        toggleMealDialog={toggleMealDialog}
      />
    </>
  );
};
