import React, { useContext } from "react";
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

  const handleRegister = async () => {
    const authToken = (document.getElementById("auth-token") as HTMLInputElement).value;
    try {
      await axios({
        headers: {
          "authorization": `Basic ${btoa(`admin:${authToken}`)}`,
        },
        method: "post",
        url: "git",
        validateStatus: (code) => code === 404,
      });
      console.log(`Auth token is valid!`);
      adminContext.updateAuthToken(authToken);
    } catch (e) {
      console.error(`Auth token is not valid: ${e.message}`);
      adminContext.updateAuthToken("");
    }
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
        : <>Supply a valid auth token to activate admin mode</>
      }
    </div>
  );
};
