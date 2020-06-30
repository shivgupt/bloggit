import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Typography,
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
import { Dishes } from "../utils/dishes";

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

export const TransferList = () => {
  const classes = useStyles();
  const [dishOptions, setDishOptions] = React.useState<Dish[]>([]);
  const [selected, setSelected] = React.useState<Dish[]>(Dishes);
  const [backDropOpen, setBackDropOpen] = React.useState(false);
  const [dishInfo, setDishInfo] = React.useState<Dish>(emptyDish);

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

  const handleInfo = (dish: Dish) => () => {
    setDishInfo(dish);
    setBackDropOpen(true);
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
      <Dialog
        open={backDropOpen}
      >
        <DialogTitle id="dish-info">
          <Typography> Nutrition Info of {dishInfo.name} </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography> Ingrdients </Typography>
        </DialogContent>
      </Dialog>
    </Card>
  );

  return (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Grid item>{customList("What did you eat?", dishOptions)}</Grid>
      <Grid item>{customList("Dish Options", selected)}</Grid>
    </Grid>
  );
};
