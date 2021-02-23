import React, { useEffect, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core"
import {
  SpeedDial,
  SpeedDialAction
} from "@material-ui/lab";
import {
  AddCircle,
  Edit,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => ({
  speedDial: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export const AppSpeedDial = () => {
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const handelRedirect = (to: string) => history.push(to)
  return (
    <SpeedDial
      ariaLabel="fab"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      className={classes.speedDial}
      icon={ <Edit />}
    >
      <SpeedDialAction
        icon={<AddCircle />}
        tooltipTitle="New Post"
        onClick={() => handelRedirect("/create-new-post")}
      />
    </SpeedDial>
  )
}