import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { store } from "../utils/cache";

export const FoodLog = (props: any) => {

  const [profile, setProfile] = useState(store.load("FitnessProfile"));
  console.log(profile);
  return (
    <>
      FoodLog
    </>
  )
}
