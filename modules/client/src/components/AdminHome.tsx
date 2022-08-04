import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Theme, styled } from "@mui/material/styles";
import RemoveCircle from "@mui/icons-material/RemoveCircle";

import React, { useState } from "react";

import { AdminMode } from "../types";

import { IndexEditor } from "./IndexEditor";

const StyledDiv = styled("Div")(({ theme }) => ({
  margin: theme.spacing(1, 1),
  "& > *": {
    margin: theme.spacing(1),
  }
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

  return (
    <div>
      {adminMode !== "invalid"
        ? (
          <StyledDiv>
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
          </StyledDiv>
        )
        : (

          <StyledDiv>
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
              sx={{ mt: 2, }}
              id="register-admin-token"
              size="small"
              onClick={() => validateAuthToken(authToken)}
              variant="contained"
            >
              Register
            </Button>
          </StyledDiv>

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
          sx={{
            margin: (1,1),
            "& > *": {
              margin: 1,
            }
          }}
        />
        : <StyledDiv>
            <Typography>
                Supply a valid admin token to activate admin mode
            </Typography>
          </StyledDiv>
      }
      {adminMode === "enabled"
        ? <StyledDiv>
          <IndexEditor />
        </StyledDiv>
        : null
      }
    </div>
  );
};
