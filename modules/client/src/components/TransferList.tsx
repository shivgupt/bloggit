import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import {
  Chip,
} from "@material-ui/core";
import {
  Info as InfoIcon,
} from "@material-ui/icons";

import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";

import { emptyDish } from "../utils/constants";
import { Dish } from "../types";
import { NutritionInfo } from "./NutritionInfo";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: "auto",
    },
    cardHeader: {
      padding: theme.spacing(1, 2),
    },
    list: {
      width: 300,
      height: 230,
      backgroundColor: theme.palette.background.paper,
      overflow: "auto",
    },
    button: {
      margin: theme.spacing(0.5, 0),
    },
  }),
);

export const TransferList = (props: any) => {
  const classes = useStyles();
  const {
    selected,
    setSelected,
    dishOptions,
    setDishOptions,
  } = props;

  const [infoDialog, setInfoDialog] = React.useState(false);
  const [selectedDish, setSelectedDish] = React.useState<Dish>(emptyDish);

  const handleToggle = (dish: Dish) => () => {
    const optionsIndex = dishOptions.indexOf(dish);
    const selectedIndex = selected.indexOf(dish);
    const newOptions = [ ...dishOptions ];
    const newSelected = [ ...selected ];

    if (optionsIndex === -1) {
      newOptions.push(dish);
      newSelected.splice(selectedIndex, 1);
    } else {
      newOptions.splice(optionsIndex, 1);
      newSelected.push(dish);
    }

    setSelected(newSelected);
    setDishOptions(newOptions);
  };

  const toggleInfoDialog = () => {
    setInfoDialog(!infoDialog);
  };

  const handleInfo = (dish: Dish) => () => {
    setSelectedDish(dish);
    setInfoDialog(true);
  };

  const customList = (title: React.ReactNode, list: Dish[]) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        title={title}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {list.map((dish: Dish) => {

          return (
            <ListItem key={dish.name} role="listitem" button onClick={handleToggle(dish)}>
              <Chip
                color="secondary"
                label={dish.name}
                onDelete={handleInfo(dish)}
                deleteIcon={<InfoIcon />}
              />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <>
      <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
        <Grid item>{customList("What did you eat?", selected)}</Grid>
        <Grid item>{customList("Dish Options", dishOptions)}</Grid>
      </Grid>
      <NutritionInfo
        open={infoDialog}
        dish={selectedDish}
        toggleOpen={toggleInfoDialog}
      />
    </>
  );
};
