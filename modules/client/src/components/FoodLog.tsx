import React, { useState } from "react";

import {
  Chip,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import {
  Delete as DeleteIcon,
} from "@material-ui/icons";

import { Dish } from "../types";
import { emptyFoodLog } from "../utils/constants";
import { getTotalNutrientsMeal } from "../utils/helper";
import { MealEntry } from "./MealEntry";

export const FoodLog = (props: any) => {

  const { profile, setProfile, setMealEntryAlert } = props;

  const [updateEntry, setUpdateEntry] = useState({ date: new Date(), meal: [] as Dish[] });

  const handleEditMeal = (date: string, time: string) => () => {
    let updateDT = new Date(date);
    updateDT.setHours(Number(time.substring(0,2)));
    updateDT.setMinutes(Number(time.substring(3,5)));
    return {
      date: updateDT,
      meal: JSON.parse(JSON.stringify(foodLog[date][time]))
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

  const foodLog = profile.foodLog;

  if (JSON.stringify(foodLog) === JSON.stringify(emptyFoodLog)) {
    return (
      <Typography>
        You have no meal entry yet!!
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="mealLog" size="small">
        <TableHead>
          <TableRow>
            <TableCell> Time </TableCell>
            <TableCell> Meal </TableCell>
            <TableCell> Nutrition </TableCell>
            <TableCell> Edit </TableCell>
          </TableRow>
        </TableHead>
        {Object.keys(foodLog).sort((a, b) => new Date(a) > new Date(b) ? -1 : 1).map((date, i) => {
          return (
            <TableBody key={i}>
              <TableRow key={date}>
                <TableCell colSpan={4} align="center"> {date} </TableCell>
              </TableRow>
              {Object.keys(foodLog[date]).sort().map((time) => {
                let totalNutrientMeal = getTotalNutrientsMeal(foodLog[date][time]);
                return (
                  <TableRow key={date+time}>
                    <TableCell> {time} </TableCell>
                    <TableCell>
                      {foodLog[date][time].map((dish) =>
                        <div key={dish.name}>
                          {dish.serving > 1
                            ? dish.serving + " x " + dish.name
                            : dish.name
                          }, &nbsp;
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {Object.entries(totalNutrientMeal).map((nutrient) => {
                        return (
                          <Chip
                            key={nutrient[0]}
                            size="small"
                            color="primary"
                            label={`(${nutrient[0].charAt(0)}) ${nutrient[1].toFixed(2)}`}
                            variant="outlined"
                          />
                        );
                      })}
                    </TableCell>
                    <TableCell>
                      <MealEntry
                        entry={handleEditMeal(date, time)}
                        profile={profile}
                        setMealEntryAlert={setMealEntryAlert}
                        setProfile={setProfile}
                        title="Update Meal Entry"
                      />
                      <IconButton onClick={handleDeleteMeal(date, time)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          );
        })}
      </Table>
    </TableContainer>
  );
};
