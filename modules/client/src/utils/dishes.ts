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
    { ... Almond, quantity: "50 g" },
    { ... Broccoli, quantity: "50 g" },
    { ... Caschew, quantity: "50 g" },
    { ... Cheese, quantity: "200 g" },
    { ... Egg, quantity: "100 g" },
    { ... WholeMilk, quantity: "100 g" },
    { ... Onion, quantity: "50 g" },
    { ... Tomato, quantity: "100 g" },
  ],
} as Dish;

const AlmondCaschewCastrol = {
  name: "Almond and Caschew Castrol",
  serving: 1,
  ingredients: [
    { ... Almond, quantity: "50 g" },
    { ... Broccoli, quantity: "50 g" },
    { ... Caschew, quantity: "50 g" },
    { ... Cheese, quantity: "200 g" },
    { ... Egg, quantity: "150 g" },
    { ... WholeMilk, quantity: "100 g" },
    { ... Onion, quantity: "50 g" },
    { ... Tomato, quantity: "100 g" },
  ],
} as Dish;

export const dishes = [ AlmondCaschewCrustPizza, AlmondCaschewCastrol ] as Dish[]
