import React, { useState, useEffect } from "react";
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
  Typography,
} from "@material-ui/core";
import {
  RestaurantMenu as FoodIcon,
  AddCircle as AddIcon,
} from "@material-ui/icons";

import { DateTime } from "./DateTimePicker";
import { TransferList } from "./TransferList";

import { Dish } from "../types";
import { Dishes } from "../utils/dishes";

import { store } from "../utils/cache";
import { dateOptions, timeOptions } from "../utils/constants";

export const AddMeal = (props: any) => {
  const {
    open,
    profile,
    setProfile,
    toggleMealDialog,
  } = props;

  const [foodLog, setFoodLog] = useState(profile.foodLog);
  const [mealTime, setMealTime] = useState(new Date());
  const [selected, setSelected] = React.useState<Dish[]>([]);
  const [dishOptions, setDishOptions] = React.useState<Dish[]>(Dishes);
  const [dishOptionsView, setDishOptionsView] = useState(false);

  useEffect(() => {
    setFoodLog(profile.foodLog);
  }, [profile.foodLog]);

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

  const toggleDishOptionsView = () => {
    console.log(`Toggling dishOptions to ${!dishOptionsView}`)
    setDishOptionsView(!dishOptionsView);
  }

  const handleAddMeal = () => {
    const date = mealTime.toLocaleDateString([], dateOptions);
    const time = mealTime.toLocaleTimeString([], timeOptions);
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
        <DateTime date={mealTime} label="What time did you eat?" setDate={setMealTime}/>
        <br />
        <br />
        <Typography variant="caption" color="textSecondary"> What all did you eat? </Typography>
        <Paper variant="outlined">
          <IconButton onClick={toggleDishOptionsView}>
            <FoodIcon />
          </IconButton>
          <List>
            {selected.map((dish: Dish) => (
              <ListItem key={dish.name} role="listitem" button onClick={handleToggle(dish)}>
                <Chip
                  color="secondary"
                  label={dish.name}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
        <Paper component="ul">
          <label> Dish Options </label>
          {dishOptions.map((dish) => (
            <ListItem key={dish.name} role="listitem" button onClick={handleToggle(dish)}>
              <Chip
                color="secondary"
                label={dish.name}
                onDelete={handleToggle(dish)}
              />
            </ListItem>
          ))}
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

/*

        <List subheader={<ListSubheader>What did you eat?</ListSubheader>}>
          {selected.map((dish: Dish) => {
            return (
              <ListItem key={dish.name} role="listitem" button onClick={handleToggle(dish)}>
                <Chip
                  color="secondary"
                  label={dish.name}
                />
              </ListItem>
            );
          })}
        </List>
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
 * */
