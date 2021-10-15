import { Static, Type } from "@sinclair/typebox";

export const EditRequest = Type.Array(Type.Object({
  content: Type.String(),
  path: Type.String(),
}));
export type EditRequest = Static<typeof EditRequest>;

export const EditResponse = Type.Object({
  commit: Type.String(),
  status: Type.String(),
});
export type EditResponse = Static<typeof EditResponse>;

export const HistoryResponseEntry = Type.Object({
  commit: Type.String(),
  path: Type.String(),
  timestamp: Type.String(),
});
export type HistoryResponseEntry = Static<typeof HistoryResponseEntry>;

export const HistoryResponse = Type.Array(HistoryResponseEntry);
export type HistoryResponse = Static<typeof HistoryResponse>;

export const ReadResponse = Type.Object({
  author: Type.String(),
  content: Type.String(),
  timestamp: Type.Number(),
});
export type ReadResponse = Static<typeof ReadResponse>;

export const RefResponse = {
  branch: Type.String(),
  commit: Type.String(),
};
export type RefResponse = Static<typeof RefResponse>;
