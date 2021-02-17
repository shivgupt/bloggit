import { PostData, Ingredient, Dish, FitnessProfile } from "../types";
import * as Dishes from "../utils/dishes";

import { emptyNutrients } from "./constants";

export const prettyDateString = (s: string) => {
  const month = s.substr(2,2);
  let m;
  
  switch (month) {
  case "01": m = "Jan"; break;
  case "02": m = "Feb"; break;
  case "03": m = "Mar"; break;
  case "04": m = "Apr"; break;
  case "05": m = "May"; break;
  case "06": m = "Jun"; break;
  case "07": m = "Jul"; break;
  case "08": m = "Aug"; break;
  case "09": m = "Sep"; break;
  case "10": m = "Oct"; break;
  case "11": m = "Nov"; break;
  case "12": m = "Dec"; break;
  }

  return `${s.substr(0,2)} ${m}, ${s.substr(4,4)}`;
};

export const compareObj = (o1: any, o2: any) => {
  return JSON.stringify(o1) === JSON.stringify(o2);
};

export const deepCopy = (value) => {
  return JSON.parse(JSON.stringify(value));
};

export const getChildValue = (child) => {
  if (!child) return;
  if (child.props.value) return child.props.value;
  return getChildValue(child.props.children[0]);
};

export const getPostsByCategories = (posts: { [slug: string]: PostData }) => {
  return (
    Object.values(posts).reduce((categories, post) => ({
      ...categories,
      [post.category]: [ ...(categories[post.category]||[]), post ]
    }), {})
  );
};

export const getTotalNutrientsDish = (dish: Dish) => {
  const total = { ...emptyNutrients };

  dish.ingredients.forEach((ingredient: Ingredient) => {
    Object.keys(ingredient.nutrients).forEach((nutrient: string) => {
      total[nutrient] += dish.serving *
        (Number(ingredient.quantity) * ingredient.nutrients[nutrient]/100);
    });
  });
  return total;
};

export const getTotalNutrientsMeal = (dishes: Dish[]) => {
  const total = { ...emptyNutrients };

  dishes.forEach((dish: Dish) => {
    const dishTotal = getTotalNutrientsDish(dish);
    Object.keys(total).forEach((nutrient: string) => {
      total[nutrient] += dishTotal[nutrient];
    });
  });

  return total;
};

export const smartConcatMeal = (meal: Dish[], newDishes: Dish[]) => {
  newDishes.forEach((dish: Dish) => {
    let i = 0;
    for (i; i < meal.length; i++) {
      if(dish.name === meal[i].name) {
        meal[i].serving += 1;
        break;
      }
    }
    if (i === meal.length) meal.push(dish);
  });
};

export const getProfileStateFromStoreObj = (profile: string) => {
  const newProfile = JSON.parse(profile);

  for (const date in newProfile.foodLog) {
    for (const time in newProfile.foodLog[date]) {
      const newMeal = [] as Dish[];
      newProfile.foodLog[date][time].forEach((mealItem) => {
        try {
          const dishObj = deepCopy(Object.values(Dishes)
            .find((dish: Dish) => dish.name === mealItem.dish)
          );
          dishObj.serving = mealItem.serving;
          newMeal.push(dishObj as Dish);
        } catch {
          console.log(mealItem.dish);
        }
      });
      newProfile.foodLog[date][time] = newMeal;
    }
  }

  return newProfile;
};

export const getProfileStoreObjFromState = (profile: FitnessProfile) => {

  const newProfile = deepCopy(profile);
  for (const date in newProfile.foodLog) {
    for (const time in newProfile.foodLog[date]) {
      const newMeal = [] as Array<{ dish: string, serving: number }>;
      newProfile.foodLog[date][time].forEach((dish: Dish) => {
        try {
          newMeal.push({ dish: dish.name, serving: dish.serving });
        } catch {
          console.log(dish);
        }
      });
      newProfile.foodLog[date][time] = newMeal;
    }
  }
  return newProfile;
};

export const formatTagsArray = (tags: string[] | undefined) => {
  if (!tags) return "";
  return tags.reduce((v,o) => v + o + ",\n", "");
}