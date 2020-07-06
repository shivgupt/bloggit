import React, { useState } from "react";

import {
  Snackbar,
  Button,
  Dialog,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Edit as EditIcon,
} from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";

import { AddMeal } from "./AddMeal";
import { ProfileEdit } from "./ProfileEdit";
import { FoodLog } from "./FoodLog";

import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [mealEntryAlert, setMealEntryAlert] = useState({
    open: false,
    severity: "" as "error" | "info" | "success" | "warning",
    msg: "",
  });

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
          setMealEntryAlert={setMealEntryAlert}
          setProfile={setProfile}
          toggleMealDialog={toggleMealDialog}
        />
      </Dialog>

      <br />
      <FoodLog
        profile={profile}
      />
      <Snackbar open={mealEntryAlert.open} autoHideDuration={6000}>
        <Alert severity={mealEntryAlert.severity}>
          <AlertTitle> {mealEntryAlert.severity} </AlertTitle>
          <strong> {mealEntryAlert.msg} </strong>
        </Alert>
      </Snackbar>
    </>
  );
};
