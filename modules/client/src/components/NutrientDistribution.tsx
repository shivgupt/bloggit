import React from "react";
import { RadialChart } from "react-vis";

export const NutrientDistribution = (props: any) => {
  const data = [{angle: 1}, {angle: 1}, {angle: 1}];
  return (
    <RadialChart
      data={data}
      width={40}
      height={40}
      radius={20}
      innerRadius={15}
    />
  );
};
