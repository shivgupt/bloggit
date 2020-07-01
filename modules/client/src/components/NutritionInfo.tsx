import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  Close as CloseIcon,
} from "@material-ui/icons";

import { Ingredient } from "../types";
import { sumNutrientsOfIngredients } from "../utils/helper";

export const NutritionInfo = (props: any) => {
  const { open, dish, toggleOpen } = props;
  console.log(dish);

  return (
    <Dialog
      open={open}
      onClose={toggleOpen}
    >
      <DialogTitle disableTypography id="dish-info">
        <Typography variant="h4"> Nutrition Info </Typography>
        <Typography variant="subtitle1" display="block" > {dish.name} </Typography>
        <Typography variant="subtitle2" display="block" > Serving: {dish.serving} </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="button"> Ingrdients </Typography>
        {dish.ingredients.map((item: Ingredient) => {
          return (
            <li key={item.name}>
              {`${item.quantity}g ${item.name}`}
            </li>
          );
        })}
        <Typography variant="button"> Total </Typography>
        {console.log(sumNutrientsOfIngredients(dish))}
      </DialogContent>
      <DialogActions>
        <IconButton onClick={toggleOpen}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};
