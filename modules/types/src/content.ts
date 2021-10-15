import { Static, Type } from "@sinclair/typebox";

export const PostData = Type.Object({
  slug: Type.String(),
  title: Type.String(),
  category: Type.Optional(Type.String()),
  draft: Type.Optional(Type.Boolean()),
  featured: Type.Optional(Type.Boolean()),
  img: Type.Optional(Type.String()),
  lastEdit: Type.Optional(Type.String()),
  path: Type.Optional(Type.String()),
  publishedOn: Type.Optional(Type.String()),
  tldr: Type.Optional(Type.String()),
});
export type PostData = Static<typeof PostData>;

export const Posts = Type.Record(Type.String(), PostData);
export type Posts = Static<typeof Posts>;

export const BlogIndex = Type.Object({
  posts: Posts,
  title: Type.String(),
});
export type BlogIndex = Static<typeof BlogIndex>;
