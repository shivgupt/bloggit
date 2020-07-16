import React, { useState } from "react";

import {
  Snackbar,
  Button,
  Dialog,
  IconButton,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  grey,
  green,
} from "@material-ui/core/colors";

import {
  DeleteForever as ResetIcon,
} from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";

import { MealEntry } from "./MealEntry";
import { Profile } from "./Profile";
import { FoodLog } from "./FoodLog";

import { store } from "../utils/cache";

const useStyles = makeStyles({
  root: {
    backgroundColor: grey[900],
  },
  typography: {
    color: green[500],
  },
});

export const FitnessTracker = (props: any) => {

  const [mealEntryAlert, setMealEntryAlert] = useState({
    open: false,
    severity: "" as "error" | "info" | "success" | "warning" | undefined,
    msg: "",
  });
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  const classes = useStyles();

  const closeSnackbar = () => setMealEntryAlert({ severity: undefined, msg: "", open: false });

  const today = new Date();

  return (
    <div className={classes.root}>
      <Profile profile={profile} setProfile={setProfile} />
      <Typography className={classes.typography} display="inline" color={"secondary"}> {today.toDateString()} </Typography>

      <br />
      <MealEntry
        profile={profile}
        setMealEntryAlert={setMealEntryAlert}
        setProfile={setProfile}
        title="Add New Meal Entry"
      />

      <br />
      <FoodLog
        profile={profile}
        setProfile={setProfile}
        setMealEntryAlert={setMealEntryAlert}
      />

      <Snackbar open={mealEntryAlert.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert severity={mealEntryAlert.severity}>
          <AlertTitle> {mealEntryAlert.severity} </AlertTitle>
          <strong> {mealEntryAlert.msg} </strong>
        </Alert>
      </Snackbar>
    </div>
  );
};
