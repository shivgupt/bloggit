import React from "react";
import { GitState } from "./types";

export const GitContext = React.createContext({
  gitState: {} as GitState,

  syncGitState: async (ref?: string, slug?: string, force?: boolean) => {},
});
