import React, { useContext, useState } from "react";
import { 
  Button,
  Divider,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import axios from "axios";

import { IndexEditor } from "./IndexEditor";
import { AdminMode } from "../types";

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
}));

export const AdminHome = (props: {
  adminMode: AdminMode,
  validateAuthToken: (_authToken?: string) => Promise<void>
}) => {

  const { adminMode, validateAuthToken } = props;
  const classes = useStyles();

  const [authToken, setAuthToken] = useState("");
  return (
    <div>
      {adminMode !== "invalid"
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
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          variant="outlined"
        />

        <Button onClick={() => validateAuthToken(authToken)}> Register </Button>
      </div>

      <Divider variant="middle" />
      { adminMode !== "invalid"
        ? (<div className={classes.section}>
          <IndexEditor />
        </div>)
        : <>Supply a valid auth token to activate admin mode</>
      }
    </div>
  );
};
