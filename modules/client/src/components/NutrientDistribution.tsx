import React from "react";
import { RadialChart } from "react-vis";
import { makeStyles } from "@material-ui/core";

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

const getDataFromTotalNutrients = (totalNutrients: Nutrients) => {
  let total = Object.values(totalNutrients).reduce(
    (s: number, v: number) => s + v, -1*totalNutrients["calories"]
  );

  const data = [] as Array<{angle: number, label: string}>;
  for (let n in totalNutrients) {
    if (n === "calories") continue;
    let newEntry = { angle: totalNutrients[n]/total, label: "", color: "" };

    switch(n) {
    case "protein":
      newEntry.label = "p";
      newEntry.color = "#FFAB91";
      break;
    case "carbohydrates":
      newEntry.label = "c";
      newEntry.color = "#FFF59D";
      break;
    case "fat":
      newEntry.label = "f";
      newEntry.color = "#90CAF9";
      break;
    }

    data.push(newEntry);
  }

  console.log(data);
  return data;
};

export const NutrientDistribution = (props: any) => {
  const classes = useStyles();
  const { totalNutrients } = props;
  if (!totalNutrients) return <> 0 </>;

  return (
    <div className={classes.root} >
      <RadialChart
        data={getDataFromTotalNutrients(totalNutrients)}
        width={40}
        height={40}
        radius={20}
        colorType="literal"
      />
      <div className={classes.text}>
        {Math.round(totalNutrients.calories)}
      </div>
    </div>
  );
};
