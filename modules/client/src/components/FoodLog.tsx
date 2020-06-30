import React, { useState } from "react";

import {
  IconButton,
} from "@material-ui/core";
import {
  AddCircle as AddIcon,
} from "@material-ui/icons";

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
  );
};
