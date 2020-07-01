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
                      {foodLog[date][time].map((dish) =>
                        <Chip
                          color="secondary"
                          label={dish.name}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {Object.keys(totalNutrientMeal).map((nutrient) => {
                        let value = totalNutrientMeal[nutrient].toFixed(2);
                        return (
                          <Chip
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
    </TableContainer>
  );
};
