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

export const sumNutrientsOfIngredients = (dish: Dish) => {
  const total = { ...emptyNutrients };

  dish.ingredients.forEach((ingredient: Ingredient) => {
    Object.keys(ingredient.nutrients).forEach((nutrient: string) => {
      total[nutrient] += Number(ingredient.quantity) * ingredient.nutrients[nutrient]/100;
    });
  });
  return total;
};
