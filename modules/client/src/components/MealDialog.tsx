import React, { useState, useEffect } from "react";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  IconButton,
  Paper,
  Popover,
  Theme,
  Typography,
  makeStyles,
  createStyles,
} from "@material-ui/core";
import {
  RestaurantMenu as FoodIcon,
  Info as InfoIcon,
  AddCircle as AddIcon,
} from "@material-ui/icons";

import { DateTime } from "./DateTimePicker";
import { NutritionInfo } from "./NutritionInfo";

import { Dish } from "../types";
import * as Dishes from "../utils/dishes";
import { smartConcatMeal } from "../utils/helper";

import { store } from "../utils/cache";
import { dateOptions, timeOptions, emptyDish } from "../utils/constants";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chipList: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      "& > *": {
        margin: theme.spacing(0.5),
      },
    },
  }),
);

export const MealDialog = (props: any) => {
  const classes = useStyles();

  const {
    open,
    profile,
    setMealEntryAlert,
    setProfile,
    toggleMealDialog,
    title,
    entry,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [dishOptionsView, setDishOptionsView] = useState(false);
  const [foodLog, setFoodLog] = useState(profile.foodLog);
  const [infoDialog, setInfoDialog] = React.useState({ open: false, dish: emptyDish });
  const [mealTime, setMealTime] = useState(new Date());
  const [selected, setSelected] = React.useState<any>({});


  useEffect(() => {
    let newSelected = {};
    entry.meal.forEach((dish: Dish) => newSelected[dish.name] = dish);
    setSelected(newSelected);
    setMealTime(entry.date);
  }, [entry]);

  useEffect(() => {
    setFoodLog(profile.foodLog);
  }, [profile.foodLog]);

  const toggleInfoDialog = () => setInfoDialog({ ...infoDialog, open: !infoDialog.open });

  const handleInfo = (dish: string) => () => setInfoDialog({ open: true, dish: Dishes[dish] });

  const handleAddDish = (dish: string) => () => {
    const newSelected = { ...selected };
    try {
      newSelected[dish].serving += 1;
    } catch {
      newSelected[dish] = { ...Dishes[dish] };
    }
    setSelected(newSelected);
    setDishOptionsView(!dishOptionsView);
  };

  const handleDeleteDish = (dish: string) => () => {
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

  const addNewMealEntry = () => {
    if (Object.keys(selected).length === 0) {
      setMealEntryAlert({
        open: true,
        severity: "error",
        msg: "You have not selected any dish! What did you eat in your meal?"
      });
      return;
    }

    const meal = [] as Dish[];
    Object.values(selected).forEach((dish) => meal.push(dish as Dish));

    const date = mealTime.toLocaleDateString([], dateOptions);
    const time = mealTime.toLocaleTimeString([], timeOptions);

    const newFoodLog = { ...foodLog };

    if (newFoodLog[date]) {
      if (newFoodLog[date][time]) {
        console.log("found date and time concatinating");

        smartConcatMeal(newFoodLog[date][time], meal);
      } else {
        console.log("found date adding time");
        newFoodLog[date][time] = meal;
      }
    } else {
      newFoodLog[date] = { [time]: meal };
    }

    setFoodLog(newFoodLog);
    const newProfile = { ...profile, foodLog: newFoodLog };

    setMealEntryAlert({
      open: true,
      severity: "success",
      msg: `You have successfully added your meal at ${time} on ${date}`
    });

    return newProfile;
  };

  const updateMealEntry = () => {
    console.log("I will Update")
    return null;
  };

  const handleAddMeal = () => {
    let newProfile;
    if (entry) {
      newProfile = updateMealEntry();
    } else {
      newProfile = addNewMealEntry();
    }

    setProfile(newProfile);
    store.save("FitnessProfile", newProfile);
    toggleMealDialog();
  };

  return (
    <Dialog
      open={open}
      onClose={toggleMealDialog}
    >
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <DateTime date={mealTime} label="What time did you eat?" setDate={setMealTime}/>
          <br />
          <br />
          <Typography variant="caption" color="textSecondary"> What all did you eat? </Typography>
          <IconButton onClick={toggleDishOptionsView}>
            <FoodIcon />
          </IconButton>
          <Popover
            id="dish-options-menu"
            anchorEl={anchorEl}
            open={dishOptionsView}
            onClose={toggleDishOptionsView}
          >
            <Paper className={classes.chipList}>
              <Typography variant="h5"> Dish Options </Typography>
              {Object.keys(Dishes).map((dish: string) => (
                <Chip
                  key={dish}
                  color="secondary"
                  label={dish}
                  onDelete={handleInfo(dish)}
                  onClick={handleAddDish(dish)}
                  deleteIcon={<InfoIcon />}
                />
              ))}
            </Paper>
          </Popover>
          <Paper variant="outlined" className={classes.chipList}>
            <NutritionInfo
              open={infoDialog.open}
              dish={infoDialog.dish}
              toggleOpen={toggleInfoDialog}
            />
            {Object.keys(selected).map((dish: string) => (
              <Chip
                key={dish}
                color="secondary"
                label={
                  selected[dish].serving > 1
                    ? selected[dish].serving + " x " + dish
                    : dish
                }
                onDelete={handleDeleteDish(dish)}
              />
            ))}
          </Paper>
        </CardContent>
        <CardActions>
          <IconButton onClick={handleAddMeal}>
            <AddIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Dialog>
  );
};
