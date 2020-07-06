import React, { useState, useEffect } from "react";
import { Alert, AlertTitle } from "@material-ui/lab";
import {
  List,
  Paper,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  ListItem,
  Popover,
  Typography,
} from "@material-ui/core";
import {
  RestaurantMenu as FoodIcon,
  Info as InfoIcon,
  AddCircle as AddIcon,
} from "@material-ui/icons";

import { DateTime } from "./DateTimePicker";
import { NutritionInfo } from "./NutritionInfo";

import { Dish } from "../types";
// import { Dishes } from "../utils/dishes";
import * as Dishes from "../utils/dishes";

import { store } from "../utils/cache";
import { dateOptions, timeOptions, emptyDish } from "../utils/constants";

export const AddMeal = (props: any) => {
  const {
    profile,
    setProfile,
    toggleMealDialog,
  } = props;

  const [foodLog, setFoodLog] = useState(profile.foodLog);
  const [mealEntryAlert, setMealEntryAlert] = useState({
    severity: "" as "error" | "info" | "success" | "warning",
    msg: "",
  });
  const [mealTime, setMealTime] = useState(new Date());
  const [selected, setSelected] = React.useState<any>({});
  const [dishOptionsView, setDishOptionsView] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [infoDialog, setInfoDialog] = React.useState(false);
  const [selectedDish, setSelectedDish] = React.useState<Dish>(emptyDish);

  useEffect(() => {
    setFoodLog(profile.foodLog);
  }, [profile.foodLog]);

  const toggleInfoDialog = () => setInfoDialog(!infoDialog);

  const handleInfo = (dish: string) => () => {
    setSelectedDish(Dishes[dish]);
    setInfoDialog(true);
  };

  const handleAdd = (dish: string) => () => {
    const newSelected = { ...selected };
    try {
      newSelected[dish].serving += 1;
    } catch {
      newSelected[dish] = { ...Dishes[dish] };
    }
    setSelected(newSelected);
  };

  const handleDelete = (dish: string) => () => {
    const newSelected = { ...selected };
    try {
      newSelected[dish].serving -= 1;
      if (newSelected[dish].serving === 0)
        delete newSelected[dish];
    } catch {
      console.log(dish);
    }
    setSelected(newSelected);
  };

  const toggleDishOptionsView = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setDishOptionsView(!dishOptionsView);
  };

  const handleAddMeal = () => {
    if (Object.keys(selected).length === 0) {
      setMealEntryAlert({
        severity: "error",
        msg: "You have not selected any dish! What did you eat in your meal?"
      });
      return;
    }

    const meal = [] as Dish[];
    Object.values(selected).forEach((dish) => meal.push(dish as Dish));
    console.log(selected);
    console.log(meal);

    const date = mealTime.toLocaleDateString([], dateOptions);
    const time = mealTime.toLocaleTimeString([], timeOptions);
    setMealEntryAlert({
      severity: "success",
      msg: `You have successfully added your meal at ${time} on ${date}`
    });
    const newFoodLog = { ...foodLog };

    if (newFoodLog[date]) {
      if (newFoodLog[time]) {
        console.log("found date and time concatinating");

        // TODO: Smart concat to increase serving of already existing dish
        newFoodLog[date][time].concat(meal);
      } else {
        console.log("found date adding time");
        newFoodLog[date][time] = meal;
      }
    } else {
      newFoodLog[date] = { [time]: meal };
    }

    setFoodLog(newFoodLog);
    const newProfile = {
      ...profile,
      foodLog: newFoodLog,
    };

    setProfile(newProfile);
    store.save("FitnessProfile", newProfile);
    toggleMealDialog();
  };

  return (
    <Card>
      <CardHeader title="New Meal Entry" />
      <CardContent>
        {mealEntryAlert.severity ?
          <Alert severity={mealEntryAlert.severity}>
            <AlertTitle> {mealEntryAlert.severity} </AlertTitle>
            <strong> {mealEntryAlert.msg} </strong>
          </Alert>
          : null
        }
        <DateTime date={mealTime} label="What time did you eat?" setDate={setMealTime}/>
        <br />
        <br />
        <Typography variant="caption" color="textSecondary"> What all did you eat? </Typography>
        <Paper variant="outlined">
          <NutritionInfo
            open={infoDialog}
            dish={selectedDish}
            toggleOpen={toggleInfoDialog}
          />
          <IconButton onClick={toggleDishOptionsView}>
            <FoodIcon />
          </IconButton>
          <List>
            {Object.keys(selected).map((dish: string) => (
              <ListItem key={dish} role="listitem" button onClick={handleDelete(dish)}>
                <Chip
                  color="secondary"
                  label={dish}
                  onDelete={handleDelete(dish)}
                />
              </ListItem>
            ))}
          </List>
          <Popover
            id="dish-options-menu"
            anchorEl={anchorEl}
            open={dishOptionsView}
            onClose={toggleDishOptionsView}
          >
            <Paper>
              <label> Dish Options </label>
              {Object.keys(Dishes).map((dish: string) => (
                <ListItem key={dish} role="listitem" button onClick={handleAdd(dish)}>
                  <Chip
                    color="secondary"
                    label={dish}
                    onDelete={handleInfo(dish)}
                    deleteIcon={<InfoIcon />}
                  />
                </ListItem>
              ))}
            </Paper>
          </Popover>
        </Paper>
      </CardContent>
      <CardActions>
        <IconButton onClick={handleAddMeal}>
          <AddIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};
