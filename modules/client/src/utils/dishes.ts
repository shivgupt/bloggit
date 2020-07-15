import { Dish } from "../types";

import * as ing from "./ingredients";

export const AlmondCaschewCrustPizza = {
  name: "Almond and Caschew Crust Pizza",
  serving: 1,
  ingredients: [
    { ...ing.Almond, quantity: "50" },
    { ...ing.Broccoli, quantity: "50" },
    { ...ing.Caschew, quantity: "50" },
    { ...ing.Cheese, quantity: "200" },
    { ...ing.Egg, quantity: "100" },
    { ...ing.WholeMilk, quantity: "100" },
    { ...ing.Onion, quantity: "50" },
    { ...ing.Tomato, quantity: "100" },
  ],
} as Dish;

export const AlmondCaschewCastrol = {
  name: "Almond and Caschew Castrol",
  serving: 1,
  ingredients: [
    { ...ing.Almond, quantity: "50" },
    { ...ing.Broccoli, quantity: "50" },
    { ...ing.Caschew, quantity: "50" },
    { ...ing.Cheese, quantity: "100" },
    { ...ing.Egg, quantity: "150" },
    { ...ing.WholeMilk, quantity: "100" },
    { ...ing.Onion, quantity: "50" },
    { ...ing.Tomato, quantity: "100" },
  ],
} as Dish;

export const CheeseNutsPlatter = {
  name: "Cheese n Nuts Platter",
  serving: 1,
  ingredients: [
    { ...ing.Cheese, quantity: "100" },
    { ...ing.Almond, quantity: "50" },
    { ...ing.Caschew, quantity: "50" },
  ],
} as Dish;

export const ChickenRoll = {
  name: "Chicken Cheese Roll",
  serving: 1,
  ingredients: [
    { ...ing.Cheese, quantity: "50" },
    { ...ing.Chicken, quantity: "25" },
    { ...ing.Onion, quantity: "25" },
    { ...ing.Tomato, quantity: "35" },
    { ...ing.RefinedFlour, quantity: "25" },
  ],
} as Dish;

export const OatsNMilk = {
  name: "Oats, milk & cherry",
  serving: 1,
  ingredients: [
    { ...ing.Oats, quantity: "100" },
    { ...ing.WholeMilk, quantity: "850" },
    { ...ing.Cherry, quantity: "900" },
  ],
} as Dish;

export const ProteinPotion = {
  name: "ProteinPotion",
  serving: 1,
  ingredients: [
    { ...ing.DoubleChocolateProtein, quantity: "30" },
    { ...ing.CoconutOil, quantity: "20" },
    { ...ing.WholeMilk, quantity: "250" },
  ],
} as Dish;


export const ThinCrustPizza = {
  name: "Thin Crust Pizza",
  serving: 1,
  ingredients: [
    { ...ing.Broccoli, quantity: "50" },
    { ...ing.Cheese, quantity: "300" },
    { ...ing.Onion, quantity: "50" },
    { ...ing.Tomato, quantity: "100" },
    { ...ing.RefinedFlour, quantity: "50" },
  ],
} as Dish;
