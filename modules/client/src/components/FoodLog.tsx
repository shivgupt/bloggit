import React, { useState } from "react";

import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

import { Dish } from "../types";
import { emptyFoodLog } from "../utils/constants";
import { getTotalNutrientsMeal } from "../utils/helper";
import { UpdateMeal } from "./UpdateMeal";

export const FoodLog = (props: any) => {

  const { profile, setProfile, setMealEntryAlert } = props;

  const [openMealUpdateDialog, setOpenMealUpdateDialog] = useState(false);
  const [updateEntry, setUpdateEntry] = useState({date: new Date(), meal: [] as Dish[]});

  const toggleMealDialog = () => setOpenMealUpdateDialog(!openMealUpdateDialog);

  const handleEditMeal = (date: string, time: string) => () => {
    console.log('I will let you edit meal entry');
    setOpenMealUpdateDialog(true);
    let updateDT = new Date(date);
    updateDT.setHours(Number(time.substring(0,2)));
    updateDT.setMinutes(Number(time.substring(3,5)));
    setUpdateEntry({date: updateDT, meal: foodLog[date][time]});
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
          </TableRow>
        </TableHead>
        {Object.keys(foodLog).sort((a, b) => new Date(a) > new Date(b) ? -1 : 1).map((date, i) => {
          return (
            <TableBody key={i}>
              <TableRow key={date}>
                <TableCell colSpan={3} align="center">
                  {date}
                </TableCell>
              </TableRow>
              {Object.keys(foodLog[date]).sort().map((time) => {
                let totalNutrientMeal = getTotalNutrientsMeal(foodLog[date][time]);
                return (
                  <TableRow key={date+time} onClick={handleEditMeal(date, time)}>
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
                      {Object.keys(totalNutrientMeal).map((nutrient) => {
                        let value = totalNutrientMeal[nutrient].toFixed(2);
                        return (
                          <Chip
                            key={nutrient}
                            size="small"
                            color="primary"
                            label={`(${nutrient.charAt(0)}) ${value}`}
                            variant="outlined"
                          />
                        );
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          );
        })}
      </Table>
      <UpdateMeal
        entry={updateEntry}
        open={openMealUpdateDialog}
        profile={profile}
        setMealEntryAlert={setMealEntryAlert}
        setProfile={setProfile}
        toggleMealDialog={toggleMealDialog}
        title="Update Meal Entry"
      />
    </TableContainer>
  );
};
