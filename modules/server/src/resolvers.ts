const ingredients = [
  {
    name: "Almond",
    quantity: 50,
  },
  {
    name: "Caschew",
    quantity: 50,
  },
  {
    name: "Cheese",
    quantity: 50,
  },
];

const dishes = [
  {
    name: "Cheese n Nuts Platter",
    serving: 1,
    ingredients: ingredients,
  },
];

export const resolvers = {
  Query: {
    dishes: () => dishes,
    ingredients: () => ingredients,
  },
};
