import React, { useState } from "react";
import { IconButton, Typography, makeStyles } from "@material-ui/core";
import { blue, cyan } from "@material-ui/core/colors";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
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
import { compareObj, deepCopy } from "../utils/helper";
import { emptyFoodLog } from "../utils/constants";
import { MealEntry } from "./MealEntry";

const useStyles = makeStyles({
  meal: {
    color: blue[200],
  },
  mealTime: {
    color: cyan[200],
  },
});

export const FoodTimeLine = (props: any) => {
  const classes = useStyles();

  const [edit, setEdit] = useState(false);

  const { profile, setProfile, setAlert } = props;

  const editMeal = (date: string, time: string) => () => {
    let updateDT = new Date(date);
    updateDT.setHours(Number(time.substring(0,2)));
    updateDT.setMinutes(Number(time.substring(3,5)));
    return {
      date: updateDT,
      meal: deepCopy(profile.foodLog[date][time]),
    };
  };

  const deleteMeal = (date: string, time: string) => () => {
    const newProfile = { ...profile };
    delete newProfile.foodLog[date][time];
    if (Object.keys(newProfile.foodLog[date]).length === 0) {
      delete newProfile.foodLog[date];
    }
    setProfile(newProfile);
  };

  if (compareObj(profile.foodLog, emptyFoodLog)) {
    return (
      <Typography color={"primary"}>
        You have no meal entry yet!!
      </Typography>
    );
  }

  return (
    <>
      {Object.keys(profile.foodLog).sort((a,b) => new Date(a) > new Date(b) ? -1: 1).map((date) => {
        return (
          <div key={"div" + date}>
            <Typography align="center" variant="subtitle2" key={"div" + date}>
              {date}
            </Typography>
            <Timeline align="right" key={date}>
              {Object.keys(profile.foodLog[date]).sort().map((time) => {
                return (
                  <TimelineItem key={time}>
                    <TimelineOppositeContent>
                      <Typography variant="caption"> {time} </Typography>
                      <IconButton color="secondary" onClick={() => setEdit(!edit)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={deleteMeal(date, time)} size="small">
                        <DeleteIcon />
                      </IconButton>

                      <MealEntry
                        open={edit}
                        setOpen={setEdit}
                        entry={editMeal(date, time)}
                        profile={profile}
                        setAlert={setAlert}
                        setProfile={setProfile}
                        title="Update Meal Entry"
                      />
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot>
                        <NutrientDistribution meal={profile.foodLog[date][time]} />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography className={classes.meal} variant="caption">
                        {profile.foodLog[date][time].map(dish => {
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
