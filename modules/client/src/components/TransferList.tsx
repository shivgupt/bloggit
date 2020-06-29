import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";

import { Dish, } from "../types";
import { AlmondCaschewCrustPizza, } from "../utils/dishes";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: "auto",
    },
    cardHeader: {
      padding: theme.spacing(1, 2),
    },
    list: {
      width: 200,
      height: 230,
      backgroundColor: theme.palette.background.paper,
      overflow: "auto",
    },
    button: {
      margin: theme.spacing(0.5, 0),
    },
  }),
);

function not(a: Dish[], b: Dish[]) {
  return a.filter((dish) => b.indexOf(dish) === -1);
}

function intersection(a: Dish[], b: Dish[]) {
  return a.filter((dish) => b.indexOf(dish) !== -1);
}

function union(a: Dish[], b: Dish[]) {
  return [...a, ...not(b, a)];
}

export const TransferList = () => {
  const classes = useStyles();
  const [checked, setChecked] = React.useState<Dish[]>([]);
  const [left, setLeft] = React.useState<Dish[]>([]);
  const [right, setRight] = React.useState<Dish[]>([AlmondCaschewCrustPizza]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (dish: Dish) => () => {
    const currentIndex = checked.indexOf(dish);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(dish);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (dishes: Dish[]) => intersection(checked, dishes).length;

  const handleToggleAll = (dishes: Dish[]) => () => {
    if (numberOfChecked(dishes) === dishes.length) {
      setChecked(not(checked, dishes));
    } else {
      setChecked(union(checked, dishes));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: React.ReactNode, dishes: Dish[]) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Checkbox
            onClick={handleToggleAll(dishes)}
            checked={numberOfChecked(dishes) === dishes.length && dishes.length !== 0}
            indeterminate={numberOfChecked(dishes) !== dishes.length && numberOfChecked(dishes) !== 0}
            disabled={dishes.length === 0}
            inputProps={{ "aria-label": "all dishes selected" }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(dishes)}/${dishes.length} selected`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {dishes.map((dish: Dish) => {
          const labelId = `transfer-list-all-item-${dish}-label`;

          return (
            <ListItem key={dish.name} role="listitem" button onClick={handleToggle(dish)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(dish) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={dish.name} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Grid item>{customList("Choices", left)}</Grid>
      <Grid item>{customList("Chosen", right)}</Grid>
    </Grid>
  );
}
