import React from "react";

import { GitState } from "./types";

export const GitContext = React.createContext({
  gitState: {} as GitState,
  syncGitState: async (_ref?: string, _slug?: string, _force?: boolean) => {},
});
