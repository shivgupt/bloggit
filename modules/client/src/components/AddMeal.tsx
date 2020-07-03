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
import { Dishes } from "../utils/dishes";

import { store } from "../utils/cache";
import { dateOptions, timeOptions, emptyDish } from "../utils/constants";

export const AddMeal = (props: any) => {
  const {
    open,
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
  const [selected, setSelected] = React.useState<Dish[]>([]);
  const [dishOptions, setDishOptions] = React.useState<Dish[]>(Dishes);
  const [dishOptionsView, setDishOptionsView] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [infoDialog, setInfoDialog] = React.useState(false);
  const [selectedDish, setSelectedDish] = React.useState<Dish>(emptyDish);

  useEffect(() => {
    setFoodLog(profile.foodLog);
  }, [profile.foodLog]);

  const toggleInfoDialog = () => setInfoDialog(!infoDialog);

  const handleInfo = (dish: Dish) => () => {
    setSelectedDish(dish);
    setInfoDialog(true);
  };

  const handleToggle = (dish: Dish) => () => {
    const optionsIndex = dishOptions.indexOf(dish);
    const selectedIndex = selected.indexOf(dish);
    const newOptions = [ ...dishOptions ];
    const newSelected = [ ...selected ];

    if (optionsIndex === -1) {
      newOptions.push(dish);
      newSelected.splice(selectedIndex, 1);
    } else {
      newOptions.splice(optionsIndex, 1);
      newSelected.push(dish);
    }

    setSelected(newSelected);
    setDishOptions(newOptions);
  }

  const toggleDishOptionsView = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setDishOptionsView(!dishOptionsView);
  }

  const handleAddMeal = () => {
    if (selected.length === 0) {
      setMealEntryAlert({ severity: "error", msg: "You have not selected any dish! What did you eat in your meal?" });
      return;
    }

    const date = mealTime.toLocaleDateString([], dateOptions);
    const time = mealTime.toLocaleTimeString([], timeOptions);
    setMealEntryAlert({ severity: "success", msg: `You have successfully added your meal at ${time} on ${date}` });
    const newFoodLog = { ...foodLog };

    if (newFoodLog[date]) {
      if (newFoodLog[time]) {
        console.log("found date and time concatinating");
        newFoodLog[date][time].concat(selected);
      } else {
        console.log("found date adding time");
        newFoodLog[date][time] = selected;
      }
    } else {
      newFoodLog[date] = { [time]: selected };
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
            {selected.map((dish: Dish) => (
              <ListItem key={dish.name} role="listitem" button onClick={handleToggle(dish)}>
                <Chip
                  color="secondary"
                  label={dish.name}
                  onDelete={handleToggle(dish)}
                />
              </ListItem>
            ))}
          </List>
          <Popover id="dish-options-menu" anchorEl={anchorEl} open={dishOptionsView} onClose={toggleDishOptionsView}>
            <Paper>
              <label> Dish Options </label>
              {dishOptions.map((dish) => (
                <ListItem key={dish.name} role="listitem" button onClick={handleToggle(dish)}>
                  <Chip
                    color="secondary"
                    label={dish.name}
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
