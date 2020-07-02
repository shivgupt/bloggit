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

import { emptyFoodLog } from "../utils/constants";
import { getTotalNutrientsMeal } from "../utils/helper";

export const FoodLog = (props: any) => {

  const { profile } = props;

  let foodLog = profile.foodLog;

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
            <TableCell> Nutrition </TableCell>
            <TableCell> Meal </TableCell>
            <TableCell> Time </TableCell>
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
                    <TableCell>
                      {Object.keys(totalNutrientMeal).map((nutrient) => {
                        let value = totalNutrientMeal[nutrient].toFixed(2);
                        return (
                          <Chip
                            size="small"
                            color="primary"
                            label={`(${nutrient.charAt(0)}) ${value}`}
                            variant="outlined"
                          />
                        );
                      })}
                    </TableCell>
                    <TableCell>
                      {foodLog[date][time].map((dish) =>
                        <Chip
                          size="small"
                          color="secondary"
                          label={dish.name}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell> {time} </TableCell>
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
