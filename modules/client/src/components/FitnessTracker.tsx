import React, { useState } from "react";

import {
  Snackbar,
  Button,
  Dialog,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  DeleteForever as ResetIcon,
} from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";

import { MealDialog } from "./MealDialog";
import { Profile } from "./Profile";
import { FoodLog } from "./FoodLog";

import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [mealEntryAlert, setMealEntryAlert] = useState({
    open: false,
    severity: "" as "error" | "info" | "success" | "warning" | undefined,
    msg: "",
  });
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [profile, setProfile] = useState(store.load("FitnessProfile"));

  const toggleMealDialog = () => setOpenMealDialog(!openMealDialog);
  const toggleResetDialog = () => setOpenResetDialog(!openResetDialog);
  const closeSnackbar = () => setMealEntryAlert({ severity: undefined, msg: "", open: false });

  const today = new Date();

  return (
    <>
      <Profile profile={profile} setProfile={setProfile} />
      <Typography display="inline"> {today.toDateString()} </Typography>

      <br />
      <Button variant="contained" color="primary" onClick={toggleMealDialog}>
        Add new Meal entry
      </Button>
      <Dialog open={openMealDialog} onClose={toggleMealDialog}>
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
      <IconButton onClick={toggleResetDialog}>
        <ResetIcon />
      </IconButton>
      <Snackbar open={openResetDialog} onClose={toggleResetDialog}>
        <Alert severity="warning" onClose={toggleResetDialog}>
          <AlertTitle> Reset FoodLog </AlertTitle>
          <strong>
            All the meal entries will be deleted and this action cannot be undo.
            Do you wish to proceed?
          </strong>
        </Alert>
      </Snackbar>
      <Snackbar open={mealEntryAlert.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert severity={mealEntryAlert.severity}>
          <AlertTitle> {mealEntryAlert.severity} </AlertTitle>
          <strong> {mealEntryAlert.msg} </strong>
        </Alert>
      </Snackbar>
    </>
  );
};
