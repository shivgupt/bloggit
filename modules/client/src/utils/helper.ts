import { PostData, Ingredient, Dish, FitnessProfile } from "../types";
import { emptyNutrients } from "./constants";
import * as Dishes from "../utils/dishes";

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
  let postsByCategory = {};
  Object.keys(posts).forEach(slug => {
    if (postsByCategory[posts[slug].category])
      postsByCategory[posts[slug].category].push(posts[slug]);
    else
      postsByCategory[posts[slug].category] = [posts[slug]];
  });
  return postsByCategory;
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
    let dishTotal = getTotalNutrientsDish(dish);
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

  for (let date in newProfile.foodLog) {
    for (let time in newProfile.foodLog[date]) {
      let newMeal = [] as Dish[];
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

  let newProfile = deepCopy(profile);
  for (let date in newProfile.foodLog) {
    for (let time in newProfile.foodLog[date]) {
      let newMeal = [] as Array<{ dish: string, serving: number }>;
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
