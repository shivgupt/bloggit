
export type HistoryResult = Array<{
  commit: string;
  path: string;
  timestamp: string;
}>;

export type DateString = string; // in ISO format

type GitAuthor = {
  name: string;
  email: string;
  timestamp: number;
  timezoneOffset: number;
};

export type GitCommit = {
  author: GitAuthor;
  committer: GitAuthor;
  gpgsig?: string;
  message: string;
  oid: string; // not standard
  parent: string[];
  tree: string;
};
