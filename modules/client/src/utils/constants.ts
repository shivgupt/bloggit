import {
  FitnessProfile,
  Dish,
  FoodLog,
  PostData,
  PostIndex,
} from "../types";

export const emptyIndex: PostIndex = {
  posts: {},
  drafts: {},
  about: "",
  title: "My Personal Website",
};

export const emptyPost: PostData = {
  category: "",
  lastEdit: "",
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
  calories: 0,
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

export const emptyMealEntry = {
  date: new Date(),
  meal: [] as Dish[],
};

export const emptyFoodLog = {} as FoodLog;

export const emptyFitnessProfile: FitnessProfile = {
  name: "",
  age: 0,
  height: "",
  foodLog: emptyFoodLog,
};

export const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

export const timeOptions = { hour12: false, hour: "2-digit", minute: "2-digit" };
