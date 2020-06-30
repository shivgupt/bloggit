import {
  FitnessProfile,
  Dish,
  FoodLog,
  PostData,
  PostIndex,
} from "../types";

export const emptyIndex: PostIndex = {
  posts: {},
  title: "My Personal Website",
};

export const emptyPost: PostData = {
  category: "",
  slug: "",
  path: "",
  tags: [],
  tldr: "",
  title: "",
};

export const emptyNutrients = {
  carbohydrates: 0.0,
  protein: 0.0,
  fat: 0.0,
};

export const emptyIngredient = {
  name: "",
  quantity: "",
  nutrients: emptyNutrients,
};

export const emptyDish: Dish = {
  name: "",
  serving: 0,
  ingredients: [],
};

export const emptyFoodLog = {} as FoodLog;

export const emptyFitnessProfile: FitnessProfile = {
  name: "",
  age: 0,
  height: "",
  foodLog: emptyFoodLog,
};
