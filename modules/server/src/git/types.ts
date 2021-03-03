
export type DateString = string; // in ISO format

export type GitTreeEntry = {
  mode: string;
  path: string;
  oid: string;
  type: "blob" | "tree" | "commit";
};
export type GitTree = GitTreeEntry[];

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
