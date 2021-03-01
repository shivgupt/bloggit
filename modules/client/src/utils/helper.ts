import { PostData } from "../types";
import emoji from "emoji-dictionary";

export const replaceEmojiString = (s: string) =>
 s.replace(/:\w+:/gi, name => emoji.getUnicode(name) || name);

export const prettyDateString = (s: string) => {
  let m: string, d: string, y: string;
  let month:number;
  if (s.includes('/')) {
    month = Number(s.substring(s.indexOf('/')+1,s.lastIndexOf('/')));
    d = s.substring(0, s.indexOf('/'));
    y = s.substring(s.lastIndexOf('/')+1);
  } else {
    month = Number(s.substr(2,2));
    d = s.substr(0,2);
    y = s.substr(4,4);
  }
  
  switch (month) {
  case 1: m = "Jan"; break;
  case 2: m = "Feb"; break;
  case 3: m = "Mar"; break;
  case 4: m = "Apr"; break;
  case 5: m = "May"; break;
  case 6: m = "Jun"; break;
  case 7: m = "Jul"; break;
  case 8: m = "Aug"; break;
  case 9: m = "Sep"; break;
  case 10: m = "Oct"; break;
  case 11: m = "Nov"; break;
  case 12: m = "Dec"; break;
  default: m = "Unknown";
  }

  return `${d} ${m}, ${y}`;
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
          ["top-level"]: [ ...(categories["top-level"] || []), post ]
        })
      }
    }, {})
  );
};
