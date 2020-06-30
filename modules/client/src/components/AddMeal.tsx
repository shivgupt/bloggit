import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  SaveAlt as SaveIcon,
} from "@material-ui/icons";

import { DateTime } from "./DateTimePicker";
import { TransferList } from "./TransferList";

export const AddMeal = (props: any) => {
  const {
    dialog,
    handleProfileSave,
    toggleMealDialog,
  } = props;

  const [date, setDate] = useState(new Date());

  return (
    <Dialog open={dialog} onClose={toggleMealDialog}>
      <DialogContent>
        <DateTime date={date} label="Meal Time" setDate={setDate}/>
        <Typography> Dishes </Typography>
        <TransferList />
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleProfileSave}>
          <SaveIcon />
        </IconButton>
        <IconButton onClick={toggleMealDialog}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};

