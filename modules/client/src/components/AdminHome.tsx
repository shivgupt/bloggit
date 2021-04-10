import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme } from "@material-ui/core/styles";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import React, { useState } from "react";

import { AdminMode } from "../types";

import { IndexEditor } from "./IndexEditor";

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

export const AdminHome = ({
  adminMode,
  setAdminMode,
  validateAuthToken,
}: {
  adminMode: AdminMode;
  setAdminMode: (val: AdminMode) => void;
  validateAuthToken: (_authToken?: string) => Promise<void>;
}) => {
  const [authToken, setAuthToken] = useState<string>("");
  const classes = useStyles();

  return (
    <div>
      {adminMode !== "invalid"
        ? (
          <div className={classes.section}>
            <Typography display="inline" variant="body1">
              This device is registered for Admin access
            </Typography>
            <Button
              id="unregister-admin-token"
              variant="outlined"
              onClick={() => {
                setAuthToken("");
                validateAuthToken("");
              }}
              startIcon={<RemoveCircle/>}
            >
              Unregister
            </Button>
          </div>
        )
        : (

          <div className={classes.section}>
            <TextField
              autoComplete={"off"}
              helperText="Register for admin mode"
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
              size="small"
              onClick={() => validateAuthToken(authToken)}
              variant="contained"
            >
              Register
            </Button>
          </div>

        )
      }

      <Divider variant="middle" />
      {adminMode !== "invalid"
        ? <FormControlLabel
            id="toggle-admin-mode"
            control={
              <Switch
                size="small"
                checked={adminMode === "enabled"}
                onChange={() => {
                  if (adminMode === "enabled") setAdminMode("disabled");
                  else setAdminMode("enabled");
                }}
              />
            }
            label="Admin Mode"
            labelPlacement="start"
            className={classes.section}
          />
        : <div className={classes.section}>
            <Typography className={classes.section}>
              Supply a valid admin token to activate admin mode
            </Typography>
          </div>
      }
      {adminMode === "enabled"
        ? <div className={classes.section}>
            <IndexEditor />
          </div>
        : null
      }
    </div>
  );
};
