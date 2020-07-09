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

import { MealDialog } from "./MealDialog";
import { ProfileEdit } from "./ProfileEdit";
import { FoodLog } from "./FoodLog";

import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [mealEntryAlert, setMealEntryAlert] = useState({
    open: false,
    severity: "" as "error" | "info" | "success" | "warning" | undefined,
    msg: "",
  });

  const toggleProfileDialog = () => setOpenProfileDialog(!openProfileDialog);
  const toggleMealDialog = () => setOpenMealDialog(!openMealDialog);
  const handleCloseSnackbar = () => setMealEntryAlert({ severity: undefined, msg: "", open: false });

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
        <MealDialog
          profile={profile}
          setMealEntryAlert={setMealEntryAlert}
          setProfile={setProfile}
          title="Add New Meal Entry"
          toggleMealDialog={toggleMealDialog}
        />
      </Dialog>

      <br />
      <FoodLog
        profile={profile}
        setProfile={setProfile}
        setMealEntryAlert={setMealEntryAlert}
      />
      <Snackbar open={mealEntryAlert.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity={mealEntryAlert.severity}>
          <AlertTitle> {mealEntryAlert.severity} </AlertTitle>
          <strong> {mealEntryAlert.msg} </strong>
        </Alert>
      </Snackbar>
    </>
  );
};
