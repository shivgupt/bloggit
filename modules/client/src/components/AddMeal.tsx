import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  AddCircle as AddIcon,
} from "@material-ui/icons";

import { DateTime } from "./DateTimePicker";
import { TransferList } from "./TransferList";

import { Dish } from "../types";
import { Dishes } from "../utils/dishes";

export const AddMeal = (props: any) => {
  const {
    open,
    profile,
    handleProfileSave,
    setProfile,
    toggleMealDialog,
  } = props;

  const [foodLog, setFoodLog] = useState(profile.foodLog);
  const [mealTime, setMealTime] = useState(new Date());
  const [selected, setSelected] = React.useState<Dish[]>([]);
  const [dishOptions, setDishOptions] = React.useState<Dish[]>(Dishes);

  useEffect(() => {
    setFoodLog(profile.foodLog);
  }, [profile.foodLog]);

  useEffect(() => {
    handleProfileSave();
  }, [profile]);

  const handleAddMeal = () => {
    const date = mealTime.toLocaleDateString();
    const time = mealTime.toLocaleTimeString();
    const newFoodLog = { ...foodLog };

    if (newFoodLog[date]) {
      if (newFoodLog[time]) {
        console.log('found date and time concatinating');
        newFoodLog[date][time].concat(selected);
      } else {
        console.log('found date adding time');
        newFoodLog[date][time] = selected;
      }
    } else {
      newFoodLog[date] = {
        [time]: selected
      }
    }

    setFoodLog(newFoodLog);
    setProfile({
      ...profile,
      foodLog: newFoodLog,
    });
    toggleMealDialog();
  };

  return (
    <Dialog open={open} onClose={toggleMealDialog}>
      <DialogTitle>
        Meal Details
      </DialogTitle>
      <DialogContent>
        <DateTime date={mealTime} label="Time" setDate={setMealTime}/>
        <Typography> Dishes </Typography>
        <TransferList
          selected={selected}
          dishOptions={dishOptions}
          setSelected={setSelected}
          setDishOptions={setDishOptions}
        />
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleAddMeal}>
          <AddIcon />
        </IconButton>
        <IconButton onClick={toggleMealDialog}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};

