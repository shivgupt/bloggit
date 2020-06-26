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
  Close as CloseIcon,
  Edit as EditIcon,
  SaveAlt as SaveIcon,
} from "@material-ui/icons";

import { ProfileEdit } from "./ProfileEdit";
import { store } from "../utils/cache";
import { emptyFoodLog } from "../utils/constants";

export const FoodLog = (props: any) => {

  const { foodLog } = props;

  let msg = "Here is your food log";
  if (JSON.stringify(foodLog) === JSON.stringify(emptyFoodLog))
    msg = "You have no meal entry yet!!";
  return (
    <>
      {msg} 
    </>
  )
}
