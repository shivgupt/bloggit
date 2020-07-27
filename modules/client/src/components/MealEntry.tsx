import React, { useState, useEffect } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Popover,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  AddCircle as AddIcon,
  Info as InfoIcon,
  RemoveCircle as RemoveIcon,
} from "@material-ui/icons";

import { DateTime } from "./DateTimePicker";
import { NutritionInfo } from "./NutritionInfo";

import { Dish } from "../types";
import * as Dishes from "../utils/dishes";
import { smartConcatMeal } from "../utils/helper";

import { dateOptions, timeOptions, emptyDish, emptyMealEntry } from "../utils/constants";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      padding: "0px",
    },
    chipList: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      "& > *": {
        margin: theme.spacing(0.5),
      },
    },
    paper: {
      width: "320px",
      height: "290px",
    },
  }),
);

export const MealEntry = (props: any) => {
  const classes = useStyles();

  const {
    open,
    setOpen,
    profile,
    setAlert,
    setProfile,
    title,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [viewDishOptions, setViewDishOptions] = useState(false);
  const [infoDialog, setInfoDialog] = React.useState({ open: false, dish: emptyDish });
  const [mealEntry, setMealEntry] = useState(emptyMealEntry);

  // Set meal entry 
  useEffect(() => { if (props.entry) setMealEntry(props.entry); }, [props.entry]);

  const toggleInfoDialog = () => setInfoDialog({ ...infoDialog, open: !infoDialog.open });
  const toggleMealDialog = () => setOpen(!open);
  const setMealTime = (date) => setMealEntry({ ...mealEntry, date });

  const handleInfo = (dish: Dish) => () => setInfoDialog({ open: true, dish });

  const handleAddDish = (dish: Dish) => () => {
    const newMealEntry = JSON.parse(JSON.stringify(mealEntry));
    newMealEntry.date = new Date(newMealEntry.date);
    const dishIndex = newMealEntry.meal.findIndex(o => o.name === dish.name);

    if (dishIndex === -1) {
      newMealEntry.meal.push(dish);
    } else {
      newMealEntry.meal[dishIndex].serving += 1;
    }

    setMealEntry(newMealEntry);
    setViewDishOptions(!viewDishOptions);
  };

  const handleDeleteDish = (dish: Dish) => () => {
    // TODO better deep copy
    const newMealEntry = JSON.parse(JSON.stringify(mealEntry));
    newMealEntry.date = new Date(newMealEntry.date);
    const dishIndex = newMealEntry.meal.findIndex(o => o.name === dish.name);

    if (dishIndex === -1) {
      console.log(`Error deleting ${dish.name}, Dish not found`);
    } else if (newMealEntry.meal[dishIndex].serving === 1){
      newMealEntry.meal.splice(dishIndex, 1);
    } else {
      newMealEntry.meal[dishIndex].serving -= 1;
    }

    setMealEntry(newMealEntry);
  };

  const toggleDishOptionsView = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setViewDishOptions(!viewDishOptions);
  };

  const addNewMealEntry = () => {
    const date = mealEntry.date.toLocaleDateString([], dateOptions);
    const time = mealEntry.date.toLocaleTimeString([], timeOptions);
    const newFoodLog = JSON.parse(JSON.stringify(profile.foodLog));

    if (mealEntry.meal.length === 0) {
      setAlert({
        open: true,
        severity: "error",
        msg: "You have not selected any dish! What did you eat in your meal?"
      });
      return;
    }

    if (newFoodLog[date]) {
      if (newFoodLog[date][time]) {
        console.log("found date and time concatinating");

        smartConcatMeal(newFoodLog[date][time], mealEntry.meal);
      } else {
        console.log("found date adding time");
        newFoodLog[date][time] = mealEntry.meal;
      }
    } else {
      newFoodLog[date] = { [time]: mealEntry.meal };
    }

    setAlert({
      open: true,
      severity: "success",
      msg: `You have successfully added your meal at ${time} on ${date}`
    });

    return { ...profile, foodLog: newFoodLog };
  };

  const updateMealEntry = () => {
    const date = mealEntry.date.toLocaleDateString([], dateOptions);
    const time = mealEntry.date.toLocaleTimeString([], timeOptions);
    const newFoodLog = JSON.parse(JSON.stringify(profile.foodLog));

    if (mealEntry.meal.length === 0) {
      try {
        delete newFoodLog[date][time];
      } finally {
        // TODO if date &| time has changed then abort ?warning/info
        if ( newFoodLog[date] && Object.keys(newFoodLog[date]).length === 0) {
          delete newFoodLog[date];
          setAlert({
            open: true,
            severity: "info",
            msg: `You have deleted all your meals on ${date}`
          });
        // TODO if date &| time has changed then abort ?warning/info
        } else {
          setAlert({
            open: true,
            severity: "info",
            msg: `You have deleted your meal at ${time} on ${date}`
          });
        }
      }
      // TODO delete old entry if date &| time has changed
    } else {
      try {
        newFoodLog[date][time] = mealEntry.meal;
      } catch {
        newFoodLog[date] = { [time]: mealEntry.meal };
      } finally {
        setAlert({
          open: true,
          severity: "success",
          msg: `You have successfully updated your meal at ${time} on ${date}`
        });
      }
    }

    return { ...profile, foodLog: newFoodLog };
  };

  const handleAddMeal = () => {
    let newProfile;
    if (props.entry) {
      newProfile = updateMealEntry();
    } else {
      newProfile = addNewMealEntry();
    }

    if (newProfile) {
      setProfile(newProfile);
      setMealEntry(emptyMealEntry);
      toggleMealDialog();
    }
  };

  return (
    <Dialog PaperProps={{ classes: { root: classes.paper}}} open={open} onClose={toggleMealDialog}>
      <DialogTitle> {title} </DialogTitle>
      <DialogContent dividers>
        <DateTime date={mealEntry.date} label="What time did you eat?" setDate={setMealTime}/>
        <br/>
        <Typography variant="caption" color="textSecondary"> What all did you eat? </Typography>
        <IconButton onClick={toggleDishOptionsView}>
          <AddIcon />
        </IconButton>
        <Popover
          id="dish-options-menu"
          anchorEl={anchorEl}
          open={viewDishOptions}
          onClose={toggleDishOptionsView}
        >
          <Paper className={classes.chipList}>
            <Typography variant="h5"> Dish Options </Typography>
            {Object.values(Dishes).map((dish: Dish) => (
              <Chip
                key={dish.name}
                color="secondary"
                label={dish.name}
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
          {mealEntry.meal.map((dish: Dish) => (
            <Chip
              key={dish.name}
              color="secondary"
              label={ dish.serving > 1 ? dish.serving + " x " + dish.name : dish.name }
              onDelete={handleDeleteDish(dish)}
              deleteIcon={<RemoveIcon />}
            />
          ))}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAddMeal}> Save </Button>
        <Button onClick={toggleMealDialog}> Cancel </Button>
      </DialogActions>
    </Dialog>
  );
};
