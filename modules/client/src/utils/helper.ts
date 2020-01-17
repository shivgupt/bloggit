import { PostData } from "../types";

export const getChildValue = (child) => {
  if (!child) return;
  if (child.props.value) return child.props.value;
  return getChildValue(child.props.children[0]);
};

export const getPostsByCategories = (posts: PostData[]) => {
  let postsByCategory = {};
  posts.forEach(p => {
    if (postsByCategory[p.category])
      postsByCategory[p.category].push(p);
    else
      postsByCategory[p.category] = [p];
  });
  return postsByCategory;
};
