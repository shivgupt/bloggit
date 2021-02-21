import React, { useContext, useState } from "react";
import { 
  Button,
  Divider,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";

import { IndexEditor } from "./IndexEditor";
import { AdminContext } from "../AdminContext";

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
}));

export const AdminHome = () => {

  const adminContext = useContext(AdminContext);
  const classes = useStyles();

  const handleRegister = () => {
    const authToken = (document.getElementById("auth-token") as HTMLInputElement).value;
    adminContext.updateAuthToken(authToken);
  };

  return (
    <div>
      {adminContext.authToken
        ? (
          <div className={classes.section}>
            <Typography variant="subtitle1">
              This device is registered for Admin access
            </Typography>
          </div>
        )
        : (
          <div className={classes.section}>
            <Typography variant="subtitle1">
              This device is NOT registered for Admin access
            </Typography>
          </div>
        )
      }

      <Divider variant="middle" />
      <div className={classes.section}>
        <TextField
          id="auth-token"
          label="Auth Token"
          placeholder="AUTH-TOKEN"
          helperText="Register device with New AUTH TOKEN"
          defaultValue={""}
          variant="outlined"
        />

        <Button onClick={handleRegister}> Register </Button>
      </div>

      <Divider variant="middle" />
      { adminContext.authToken
        ? (<div className={classes.section}>
          <IndexEditor />
        </div>)
        : <>SOmething wenT Wrong!</>
      }
    </div>
  );
};