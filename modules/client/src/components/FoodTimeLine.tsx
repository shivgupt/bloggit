import React from "react";

import {
  IconButton,
  Typography,
} from "@material-ui/core";
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

import {
  compareObj,
  deepCopy,
  getTotalNutrientsMeal,
} from "../utils/helper";
import { emptyFoodLog } from "../utils/constants";
import { MealEntry } from "./MealEntry";

export const FoodTimeLine = (props: any) => {

  const { profile, setProfile, setMealEntryAlert } = props;
  const foodLog = profile.foodLog;

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
      <Typography>
        You have no meal entry yet!!
      </Typography>
    );
  }

  return (
    <>
      {Object.keys(foodLog).sort((a,b) => new Date(a) > new Date(b) ? -1: 1).map((date) => {
        return (
          <div key={"div-" + date}>
            <Typography variant="subtitle2" color="textSecondary" key={"typography" + date}>
              {date}
            </Typography>
            <Timeline align="alternate" key={date}>
              {Object.keys(foodLog[date]).sort().map((time) => {
                let totalNutrientMeal = getTotalNutrientsMeal(foodLog[date][time]);
                return (
                  <TimelineItem key={time}>
                    <TimelineOppositeContent>
                      <Typography variant="button"> {time} </Typography>
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
                        {totalNutrientMeal["calories"]}
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="caption">
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
