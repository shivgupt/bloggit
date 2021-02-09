import React, { useContext } from "react";
import { 
  Button,
  Divider,
  makeStyles,
  TextField,
  Theme,
  Typography,
 } from "@material-ui/core";

import { AdminContext } from "../AdminContext";

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    margin: theme.spacing(3, 2),
    '& > *': {
      margin: theme.spacing(1),
    }
  },
}))
export const AdminHome = (props: any) => {

  const adminContext = useContext(AdminContext);
  const classes = useStyles();

  const handleRegister = () => {
    const id = (document.getElementById("key-id") as HTMLInputElement).value;
    const value = (document.getElementById("key-value") as HTMLInputElement).value;
    console.log(adminContext.updateKey);
    adminContext.updateKey({id, value});
  }
  return (
    <div>
      
      <Typography variant="h4"> Admin Key</Typography>
      {adminContext.key && adminContext.key.id
        ? (
          <div className={classes.section}>
            <TextField
              disabled
              id="key-id-registered"
              label="Key ID"
              variant="outlined"
              value={adminContext.key.id}
            />
            <TextField
              disabled
              id="key-value-registered"
              label="Key Value"
              variant="outlined"
              value={adminContext.key.value}
            />
          </div>
        )
        : (
          <div className={classes.section}>
            <Typography variant="subtitle1">
              You have no key registered on this device for Admin access
            </Typography>
          </div>
        )
      }

      <Divider variant="middle" />
      <div className={classes.section}>
        <Typography variant="h6">Use auth token to register new key for this device</Typography>

        <TextField
          id="key-id"
          label="Key ID"
          placeholder="mobile-key"
          defaultValue={""}
        />

        <TextField
          id="key-value"
          label="(NEW) Public Key"
          placeholder="mobile-key-value"
          defaultValue={""}
        />

        <TextField
          id="authorized-key"
          label="Auth Token"
          placeholder="authorized-token"
        />
        <Button onClick={handleRegister}> Register </Button>
      </div>

    </div>
  )
};