
export type EditRequest = Array<{
  path: string;
  content: string;
}>;

export type EditResponse = {
  status: string;
  commit: string;
};

export type HistoryResponse = Array<{
  commit: string;
  path: string;
  timestamp: string;
}>;

export type ReadResponse = {
  author: string;
  timestamp: number;
  content: string;
};

