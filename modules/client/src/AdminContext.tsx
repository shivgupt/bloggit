import React from "react";
import { GitState } from "./types";

export const AdminContext = React.createContext({
  gitState: {} as GitState,

  // eslint-disable-next-line
  syncGitState: async (ref?: string, slug?: string, force?: boolean) => {},
});
