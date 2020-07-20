import React from "react";

import {
  IconButton,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  blue,
  cyan,
  green,
  red,
  yellow,
} from "@material-ui/core/colors";
import {
  Delete as DeleteIcon,
} from "@material-ui/icons";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@material-ui/lab";
import { NutrientDistribution } from "./NutrientDistribution";

import {
  compareObj,
  deepCopy,
  getTotalNutrientsMeal,
} from "../utils/helper";
import { emptyFoodLog } from "../utils/constants";
import { MealEntry } from "./MealEntry";

const useStyles = makeStyles({
  calories: {
    color: red[700],
  },
  meal: {
    color: yellow[700],
  },
  mealTime: {
    color: cyan[400],
  },
  root: {
    color: green[500],
  },
  today: {
    color: blue[400],
  },
});

export const FoodTimeLine = (props: any) => {

  const { profile, setProfile, setMealEntryAlert } = props;
  const foodLog = profile.foodLog;
  const classes = useStyles();

  const handleEditMeal = (date: string, time: string) => () => {
    let updateDT = new Date(date);
    updateDT.setHours(Number(time.substring(0,2)));
    updateDT.setMinutes(Number(time.substring(3,5)));
    return {
      date: updateDT,
      meal: deepCopy(foodLog[date][time]),
    };
  };

  const handleDeleteMeal = (date: string, time: string) => () => {
    const newProfile = { ...profile };
    delete newProfile.foodLog[date][time];
    if (Object.keys(newProfile.foodLog[date]).length === 0) {
      delete newProfile.foodLog[date];
    }
    setProfile(newProfile);
  };

  if (compareObj(profile.foodLog, emptyFoodLog)) {
    return (
      <Typography className={classes.root}>
        You have no meal entry yet!!
      </Typography>
    );
  }

  return (
    <>
      {Object.keys(foodLog).sort((a,b) => new Date(a) > new Date(b) ? -1: 1).map((date) => {
        return (
          <div key={"div-" + date}>
            <Typography
              align="center"
              className={classes.today}
              variant="subtitle2"
              key={"div" + date}
            >
              {date}
            </Typography>
            <Timeline align="right" key={date}>
              {Object.keys(foodLog[date]).sort().map((time) => {
                let totalNutrientMeal = getTotalNutrientsMeal(foodLog[date][time]);
                return (
                  <TimelineItem key={time}>
                    <TimelineOppositeContent>
                      <Typography
                        className={classes.mealTime}
                        variant="button"
                      >
                        {time}
                      </Typography>
                      <IconButton color="secondary" onClick={handleDeleteMeal(date, time)}>
                        <DeleteIcon />
                      </IconButton>
                      <MealEntry
                        entry={handleEditMeal(date, time)}
                        profile={profile}
                        setMealEntryAlert={setMealEntryAlert}
                        setProfile={setProfile}
                        title="Update Meal Entry"
                      />
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot>
                        <NutrientDistribution totalNutrients={totalNutrientMeal} />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography className={classes.meal} variant="caption">
                        {foodLog[date][time].map(dish => {
                          if (dish.serving > 1) return "2x " + dish.name + ", ";
                          else return dish.name + ", ";
                        })}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </div>
        );
      })}
    </>
  );
};
