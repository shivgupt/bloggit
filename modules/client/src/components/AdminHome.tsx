import React, { useContext, useState } from "react";
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

  const JsonEditor = (props: any) => {
    const { root } = props;

    return (<>{
      Object.entries(root).map(([key,value]) => { 
      switch(typeof(value)) {
        case 'string':
          console.log('string');
          return <TextField
            id={"key" + key}
            key={key}
            label={key}
            variant="outlined"
            defaultValue={value}
          />
          
        case 'object':
          console.log(value);
          if (value && (value as Array<any>).length ) {
            const val = (value as Array<any>).reduce((v, o) =>  v + o + "\n", "");
           return <TextField 
                key={key}
                label={key}
                multiline
                defaultValue={val}
             />
          } else {
             return <Typography key={key}>Processing Key: {key}</Typography> //<JsonEditor root={value} />
            //return <JsonEditor root={value} />
          }
          
        default:
          return <Typography key={key}> Unknown {key} {typeof(value)}</Typography>
      }})
    }</>);
  };

  console.log(adminContext.index);

  return (
    <div>
      {adminContext.authToken
        ? (
          <div className={classes.section}>
            <TextField
              disabled
              id="auth-token-registered"
              label="Registered Auth Token"
              variant="outlined"
              value={adminContext.authToken}
            />
          </div>
        )
        : (
          <div className={classes.section}>
            <Typography variant="subtitle1">
              You have not registered this device for Admin access
            </Typography>
          </div>
        )
      }

      <Divider variant="middle" />
      <div className={classes.section}>
        <Typography variant="h6">Use auth token to register this device</Typography>

        <TextField
          id="auth-token"
          label="Auth Token"
          placeholder="AUTH-TOKEN"
          defaultValue={""}
        />

        <Button onClick={handleRegister}> Register </Button>
      </div>

      <Divider variant="middle" />
      { adminContext.authToken
        ? (<div className={classes.section}>
          <JsonEditor root={adminContext.index} />
        </div>)
        : <>SOmething wenT Wrong!</>
      }
    </div>
  );
};