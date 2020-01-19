import { PostData } from "../types";

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
