import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  AddCircle as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  SaveAlt as SaveIcon,
} from "@material-ui/icons";

import { store } from "../utils/cache";
import { AddMeal } from "./AddMeal";
import { emptyFoodLog } from "../utils/constants";

export const FoodLog = (props: any) => {

  const { foodLog, handleProfileSave } = props;

  const [dialog, setDialog] = useState(false);

  const toggleMealDialog = () => setDialog(!dialog);

  let msg = "Here is your food log";
  if (JSON.stringify(foodLog) === JSON.stringify(emptyFoodLog))
    msg = "You have no meal entry yet!!";

  return (
    <>
      {msg} 
      <IconButton onClick={toggleMealDialog}>
        <AddIcon />
      </IconButton>
      <AddMeal
        dialog={dialog}
        foodLog={foodLog}
        handleProfileSave={handleProfileSave}
        toggleMealDialog={toggleMealDialog}
      />
    </>
  )
}
