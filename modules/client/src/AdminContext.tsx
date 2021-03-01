import React from "react";
import { GitState } from "./types";

export const AdminContext = React.createContext({
  newContent: "",
  gitState: {} as GitState,

  // eslint-disable-next-line
  setNewContent: (newContent: string) => {},
  syncGitState: async (ref?: string, slug?: string, force?: boolean) => {},
});
