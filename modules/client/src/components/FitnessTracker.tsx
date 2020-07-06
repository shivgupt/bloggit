import React, { useState } from "react";

import {
  Button,
  Dialog,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Edit as EditIcon,
} from "@material-ui/icons";

import { AddMeal } from "./AddMeal";
import { ProfileEdit } from "./ProfileEdit";
import { FoodLog } from "./FoodLog";

import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openMealDialog, setOpenMealDialog] = useState(false);

  const toggleProfileDialog = () => setOpenProfileDialog(!openProfileDialog);
  const toggleMealDialog = () => setOpenMealDialog(!openMealDialog);

  const today = new Date();

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
        setProfile={setProfile}
        toggleProfileDialog={toggleProfileDialog}
      />

      <br />
      <Button onClick={toggleMealDialog}>
        Add new Meal entry
      </Button>
      <Dialog
        open={openMealDialog}
        onClose={toggleMealDialog}
      >
        <AddMeal
          profile={profile}
          setProfile={setProfile}
          toggleMealDialog={toggleMealDialog}
        />
      </Dialog>

      <br />
      <FoodLog
        profile={profile}
      />
    </>
  );
};
