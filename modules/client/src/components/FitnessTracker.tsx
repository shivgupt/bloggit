import React, { useState, useEffect } from "react";

import {
  Snackbar,
  Typography,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

import { MealEntry } from "./MealEntry";
import { Profile } from "./Profile";
import { FoodTimeLine } from "./FoodTimeLine";

import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [mealEntryAlert, setMealEntryAlert] = useState({
    open: false,
    severity: "" as "error" | "info" | "success" | "warning" | undefined,
    msg: "",
  });
  const [profile, setProfile] = useState(store.load("FitnessProfile"));

  useEffect(() => {
    store.save("FitnessProfile", profile);
  }, [profile]);

  const closeSnackbar = () => setMealEntryAlert({ severity: undefined, msg: "", open: false });

  const today = new Date();

  return (
    <>
      <Profile profile={profile} setProfile={setProfile} />
      <Typography display="inline"> {today.toDateString()} </Typography>

      <br />
      <MealEntry
        profile={profile}
        setMealEntryAlert={setMealEntryAlert}
        setProfile={setProfile}
        title="Add New Meal Entry"
      />

      <br />
      <FoodTimeLine
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
    </>
  );
};
