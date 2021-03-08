import { PostData } from "@blog/types";
import emoji from "emoji-dictionary";

export const slugify = (s: string) => s
  .toLocaleLowerCase()
  .replace(/[^a-z0-9 -]/g, "")
  .replace(/\W+/g, "-")
  .replace(/^-+/g, "")
  .replace(/-+$/g, "");

export const replaceEmojiString = (s: string) =>
  s.replace(/:\w+:/gi, name => emoji.getUnicode(name) || name);

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
    Object.values(posts).reduce((categories, post) => {
      if (post.category) {
        return ({
          ...categories,
          [post.category.toLocaleLowerCase()]: [
            ...(categories[post.category.toLocaleLowerCase()]||[]),
            post
          ]
        })
      } else {
        return ({
          ...categories,
          "top-level": [ ...(categories["top-level"] || []), post ]
        })
      }
    }, {})
  );
};
