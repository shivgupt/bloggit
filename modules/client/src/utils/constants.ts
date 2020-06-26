import {
  FitnessProfile,
  FoodItem,
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

export const emptyFoodItem: FoodItem = {
  name: "",
  nutrients: {
    carbohydrates: "",
    protein: "",
    fat: "",
  },
};

export const emptyFoodLog = {} as FoodLog;

export const emptyFitnessProfile: FitnessProfile = {
  name: "",
  age: 0,
  foodLog: emptyFoodLog,
};
