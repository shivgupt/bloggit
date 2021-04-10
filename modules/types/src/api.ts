export type EditRequest = Array<{
  content: string;
  path: string;
}>;

export type EditResponse = {
  commit: string;
  status: string;
};

export type HistoryResponseEntry = {
  commit: string;
  path: string;
  timestamp: string;
};
export type HistoryResponse = HistoryResponseEntry[]

export type ReadResponse = {
  author: string;
  content: string;
  timestamp: number;
};

export type RefResponse = {
  branch: string;
  commit: string;
};
