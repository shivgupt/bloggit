export type PostData = {
  category: string;
  content?: string;
  img?: string;
  path: string;
  slug: string;
  tags: string[];
  title: string;
  tldr: string;
};

export type PostIndex = {
  posts: { [slug: string]: PostData };
  style?: any;
  title: string;
}

export type FoodItem = {
  name: string;
  nutrients: {
    carbohydrates: string;
    protein: string;
    fat: string;
  };
}

export type FoodLog = {
  [date: string]: {
    [time: string]: Array<{
      item: FoodItem;
      serving: number; /* serving size in grams */
    }>;
  };
}

export type FitnessProfile = {
  name: string;
  age: number;
  height: string;
  foodLog: FoodLog;
}
