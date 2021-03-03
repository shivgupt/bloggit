import React, { useState } from "react";
import { 
  Button,
  Divider,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";

import { IndexEditor } from "./IndexEditor";
import { AdminMode } from "../types";

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
  button: {
    marginTop: theme.spacing(2)
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
          autoComplete={"off"}
          helperText="Register device by providing the admin token"
          id="admin-token"
          label="Admin Token"
          onChange={(e) => setAuthToken(e.target.value)}
          placeholder="Admin Token"
          value={authToken}
          variant="outlined"
        />

        <Button
          className={classes.button}
          id="register-admin-token"
          onClick={() => validateAuthToken(authToken)}
          variant="contained"
        >
          Register
        </Button>
      </div>

      <Divider variant="middle" />
      { adminMode !== "invalid"
        ? (<div className={classes.section}>
          <IndexEditor />
        </div>)
        : <>Supply a valid admin token to activate admin mode</>
      }
    </div>
  );
};
