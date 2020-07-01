import React, { useState } from "react";

import {
  Typography,
} from "@material-ui/core";

import { emptyFoodLog } from "../utils/constants";

export const FoodLog = (props: any) => {

  const { foodLog } = props;

  let msg = "Here is your food log";
  if (JSON.stringify(foodLog) === JSON.stringify(emptyFoodLog))
    msg = "You have no meal entry yet!!";

  return (
    <Typography>
      {msg} 
    </Typography>
  );
};
