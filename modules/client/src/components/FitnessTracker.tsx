import React, { useState, useEffect } from "react";

import {
  Button,
  Snackbar,
  Typography,
} from "@material-ui/core";
import {
  AddCircle as AddIcon,
} from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";

import { MealEntry } from "./MealEntry";
import { Profile } from "./Profile";
import { FoodTimeLine } from "./FoodTimeLine";

import { store } from "../utils/cache";

export const FitnessTracker = (props: any) => {

  const [add, setAdd] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: "" as "error" | "info" | "success" | "warning" | undefined,
    msg: "",
  });
  const [profile, setProfile] = useState(store.load("FitnessProfile"));

  useEffect(() => {
    store.save("FitnessProfile", profile);
  }, [profile]);

  const closeSnackbar = () => setAlert({ severity: undefined, msg: "", open: false });

  const today = new Date();

  return (
    <>
      <Profile profile={profile} setProfile={setProfile} />
      <Typography display="inline">
        {today.toDateString()}
      </Typography>

      <br />
      <Button
        color="secondary"
        startIcon={<AddIcon />}
        size="small"
        onClick={() => setAdd(!add)}
      >
        Add Meal
      </Button>
      <MealEntry
        open={add}
        setOpen={setAdd}
        profile={profile}
        setAlert={setAlert}
        setProfile={setProfile}
        title="Add New Meal Entry"
      />

      <br />
      <FoodTimeLine
        profile={profile}
        setProfile={setProfile}
        setAlert={setAlert}
      />

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert severity={alert.severity}>
          <AlertTitle> {alert.severity} </AlertTitle>
          <strong> {alert.msg} </strong>
        </Alert>
      </Snackbar>
    </>
  );
};
