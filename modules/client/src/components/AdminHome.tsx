import React, { useContext } from "react";
import { 
  Button,
  Checkbox,
  TextField,
  Typography,
 } from "@material-ui/core";

import { AdminContext } from "../AdminContext";

export const AdminHome = (props: any) => {

  const adminContext = useContext(AdminContext);

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
          <>
            <Typography variant="h6">{adminContext.key.id}</Typography>
            <Typography variant="h6">{adminContext.key.value}</Typography>
          </>
        )
        : (
          <>
            <Typography variant="subtitle1">
              You have no key registered on this device for Admin access
            </Typography>
            <Typography variant="h6">Use authorized key to register new key</Typography>

            &nbsp;

            <TextField
              id="key-id"
              label="Key ID"
              placeholder="mobile-key"
              defaultValue={""}
            />

            <TextField
              id="key-value"
              label="(NEW) Public Key"
              placeholder="mobile-pubKey-value"
              defaultValue={""}
            />

            <TextField
              id="authorized-key"
              label="Authorized Private Key"
              placeholder="authorized-privKey-value"
            />
            <Button onClick={handleRegister}> Register </Button>
          </>
        )
      }

    </div>
  )
};