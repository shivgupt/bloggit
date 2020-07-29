import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  AddCircle as AddIcon,
  Close as CloseIcon,
  RemoveCircle as RemoveIcon,
} from "@material-ui/icons";

import { Ingredient } from "../types";
import { NutrientDistribution } from "./NutrientDistribution";
import { deepCopy, getTotalNutrientsDish } from "../utils/helper";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "320px",
      height: "600px",
    },
  }),
);

export const NutritionInfo = (props: any) => {
  const classes = useStyles();

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
    <Dialog PaperProps={{ classes: { root: classes.root } }} open={info.open} onClose={toggleInfo}>
      <DialogTitle disableTypography id="dish-info">
        <Typography variant="h6" display="block"> {info.dish.name} </Typography>
        <Typography variant="subtitle2" display="block">
          Serving:
          <IconButton onClick={subServing}> <RemoveIcon /> </IconButton>
          {info.dish.serving}
          <IconButton onClick={addServing}> <AddIcon /> </IconButton>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <NutrientDistribution showTotals={true} meal={[info.dish]} h={60} w={60} r={30} />
        <Divider />
        <br />
        <Typography variant="button"> Ingrdients (per 1 serving) </Typography>
        {info.dish.ingredients.map((item: Ingredient) => {
          return <li key={item.name}> {`${item.quantity}g ${item.name}`} </li>;
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={toggleInfo}> Cancel </Button>
        <Button onClick={save}> Add </Button>
      </DialogActions>
    </Dialog>
  );
};
