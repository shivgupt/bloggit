import React, { useState } from "react";
import { DiscreteColorLegend, RadialChart } from "react-vis";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Popover,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { getTotalNutrientsMeal } from "../utils/helper";

import { Nutrients } from "../types";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    position: "absolute",
    padding: "2px",
    fontSize: "0.9rem",
    color: "black",
    fontWeight: "bold"
  },
});

export const NutrientDistribution = (props: any) => {
  const classes = useStyles();
  const { meal, w, h, r, showTotals } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const NutrientTotals = () => {
    return (
      <div className={classes.root}>
        <Typography variant="body1" display="block"> {totalNutrients.calories} Cal </Typography>
        <Divider variant="middle"/>

        <Typography variant="caption">
          🌾 {Math.round(totalNutrients.carbohydrates)}g
          <br />
          ~ {Math.round(data[data.findIndex(o => o.label === 'c')].angle)}% Carb
        </Typography>
        &nbsp;
        <Divider orientation="vertical" flexItem />
        &nbsp;
        <Typography variant="caption">
          🥩 {Math.round(totalNutrients.protein)}g
          <br />
          ~ {Math.round(data[data.findIndex(o => o.label === 'p')].angle)}% Protein
        </Typography>
        &nbsp;
        <Divider orientation="vertical" flexItem />
        &nbsp;
        <Typography variant="caption">
          🧈 {Math.round(totalNutrients.fat)}g
          <br />
          ~ {Math.round(data[data.findIndex(o => o.label === 'f')].angle)}% Fat
        </Typography>
      </div>
    )
  };

  const openInfoDialog = (event: React.MouseEvent<HTMLDivElement>) => {
    setOpen(!open);
    setAnchorEl(event.currentTarget);
  };

  const getDataFromTotalNutrients = (totalNutrients: Nutrients) => {
    let total = Object.values(totalNutrients).reduce(
      (s: number, v: number) => s + v, -1*totalNutrients["calories"]
    );

    const data = [] as Array<{angle: number, label: string, color: string}>;
    for (let n in totalNutrients) {
      if (n === "calories") continue;
      let newEntry = { angle: 100*totalNutrients[n]/total, label: "", color: "" };

      switch(n) {
      case "protein":
        newEntry.color = "#FFAB91";
        newEntry.label = "p";
        break;
      case "carbohydrates":
        newEntry.color = "#FFF59D";
        newEntry.label = "c";
        break;
      case "fat":
        newEntry.color = "#90CAF9";
        newEntry.label = "f";
        break;
      }

      data.push(newEntry);
    }

    return data;
  };

  if (!meal) return <> 0 </>;
  const totalNutrients = getTotalNutrientsMeal(meal);
  const data = getDataFromTotalNutrients(totalNutrients);

  console.log(data);
  return (
    <>
      <div onClick={openInfoDialog} className={classes.root} >
        <RadialChart data={data} width={w} height={h} radius={r} colorType="literal" />
        <div className={classes.text}> {Math.round(totalNutrients.calories)} </div>
      </div>
      <br />
      { showTotals ? <NutrientTotals /> : (
        <Popover
          open={open}
          onClose={() => setOpen(!open)}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Card>
            <CardHeader title="Nutrient Details" />
            <CardContent> <NutrientTotals /> </CardContent>
          </Card>
        </Popover>
      )}
    </>
  );
};
