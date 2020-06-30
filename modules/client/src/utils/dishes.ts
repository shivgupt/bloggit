import { Dish } from "../types";

import {
  Almond,
  Broccoli,
  Caschew,
  Cheese,
  Egg,
  WholeMilk,
  Onion,
  Tomato,
} from "./ingredients";

const AlmondCaschewCrustPizza = {
  name: "Almond and Caschew Crust Pizza",
  serving: 1,
  ingredients: [
    { ...Almond, quantity: "50" },
    { ...Broccoli, quantity: "50" },
    { ...Caschew, quantity: "50" },
    { ...Cheese, quantity: "200" },
    { ...Egg, quantity: "100" },
    { ...WholeMilk, quantity: "100" },
    { ...Onion, quantity: "50" },
    { ...Tomato, quantity: "100" },
  ],
} as Dish;

const AlmondCaschewCastrol = {
  name: "Almond and Caschew Castrol",
  serving: 1,
  ingredients: [
    { ...Almond, quantity: "50" },
    { ...Broccoli, quantity: "50" },
    { ...Caschew, quantity: "50" },
    { ...Cheese, quantity: "200" },
    { ...Egg, quantity: "150" },
    { ...WholeMilk, quantity: "100" },
    { ...Onion, quantity: "50" },
    { ...Tomato, quantity: "100" },
  ],
} as Dish;

export const Dishes = [ AlmondCaschewCrustPizza, AlmondCaschewCastrol ] as Dish[];
