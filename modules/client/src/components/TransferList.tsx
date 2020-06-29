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
import { dishes, } from "../utils/dishes";

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
  const [right, setRight] = React.useState<Dish[]>(dishes);

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

  const numberOfChecked = (total: Dish[]) => intersection(checked, total).length;

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

  const customList = (title: React.ReactNode, items: Dish[]) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {items.map((item: Dish) => {
          const labelId = `transfer-list-all-item-${item}-label`;

          return (
            <ListItem key={item.name} role="listitem" button onClick={handleToggle(item)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(item) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={item.name} />
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
