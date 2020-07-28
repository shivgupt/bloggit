import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  AddCircle as AddIcon,
  Close as CloseIcon,
  RemoveCircle as RemoveIcon,
} from "@material-ui/icons";

import { Ingredient } from "../types";
import { deepCopy, getTotalNutrientsDish } from "../utils/helper";

export const NutritionInfo = (props: any) => {
  const { info, setInfo } = props;
  const [total, setTotal] = useState(getTotalNutrientsDish(info.dish));

  const toggleInfo = () => setInfo({ ...info, open: !info.open });
  const addServing = () => {
    const newInfo = deepCopy(info);
    newInfo.dish.serving += 0.5;
    setInfo(newInfo);
    console.log(getTotalNutrientsDish(newInfo.dish));
    setTotal(getTotalNutrientsDish(newInfo.dish));
  };
  const subServing = () => {
    if (info.dish.serving === 0) return;
    const newInfo = deepCopy(info);
    newInfo.dish.serving -= 0.5;
    setInfo(newInfo);
    console.log(getTotalNutrientsDish(newInfo.dish));
    console.log(newInfo.dish)
    setTotal(getTotalNutrientsDish(newInfo.dish));
  };
  const save = () => { props.addDish(info.dish)(); toggleInfo(); };

  return (
    <Dialog open={info.open} onClose={toggleInfo}>
      <DialogTitle disableTypography id="dish-info">
        <Typography variant="h4"> Nutrition Info </Typography>
        <Typography variant="subtitle1" display="block"> {info.dish.name} </Typography>
        <Typography variant="subtitle2" display="block">
          Serving:
          <IconButton onClick={subServing}> <RemoveIcon /> </IconButton>
          {info.dish.serving}
          <IconButton onClick={addServing}> <AddIcon /> </IconButton>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="button"> Ingrdients </Typography>
        {info.dish.ingredients.map((item: Ingredient) => {
          return (
            <li key={item.name}>
              {`${item.quantity}g ${item.name}`}
            </li>
          );
        })}
        <br/>
        <br/>
        <Typography variant="button"> Total </Typography>
        {Object.keys(total).map((key) => {
          return <li key={key}> {`${key}: ${total[key].toFixed(2)}g`} </li>;
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={toggleInfo}> Cancel </Button>
        <Button onClick={save}> Ok </Button>
      </DialogActions>
    </Dialog>
  );
};
