import React, { useState } from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

import { emptyFoodLog } from "../utils/constants";
import { getTotalNutrientsMeal } from "../utils/helper";

export const FoodLog = (props: any) => {

  const { foodLog } = props;

  if (JSON.stringify(foodLog) === JSON.stringify(emptyFoodLog)) {
    return (
      <Typography>
        You have no meal entry yet!!
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="mealLog">
        <TableHead>
          <TableRow>
            <TableCell> Time </TableCell>
            <TableCell> Meal </TableCell>
            <TableCell> Nutrition </TableCell>
          </TableRow>
        </TableHead>
        {Object.keys(foodLog).map((date, i) => {
          return (
            <TableBody key={i}>
              <TableRow key={date}>
                <TableCell colSpan={3} align="center">
                  {date}
                </TableCell>
              </TableRow>
              {Object.keys(foodLog[date]).map((time) => {
                let totalNutrientMeal = getTotalNutrientsMeal(foodLog[date][time]);
                return (
                  <TableRow key={date+time}>
                    <TableCell> {time} </TableCell>
                    <TableCell>
                      {foodLog[date][time].map((dish) => <> {dish.name}, &nbsp; </>)}
                    </TableCell>
                    <TableCell>
                      {Object.keys(totalNutrientMeal).map((nutrient) => <>
                        {nutrient}: {totalNutrientMeal[nutrient].toFixed(2)}g, &nbsp;
                        </>)}
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
