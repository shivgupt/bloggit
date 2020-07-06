import { PostData, Ingredient, Dish } from "../types";
import { emptyNutrients } from "./constants";

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
      total[nutrient] += Number(ingredient.quantity) * ingredient.nutrients[nutrient]/100;
    });
  });
  return total;
};

export const getTotalNutrientsMeal = (dishes: Dish[]) => {
  const total = { ...emptyNutrients };

  dishes.forEach((dish: Dish) => {
    let dishTotal = getTotalNutrientsDish(dish);
    Object.keys(total).forEach((nutrient: string) => {
      total[nutrient] += Number(dish.serving) * dishTotal[nutrient];
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
