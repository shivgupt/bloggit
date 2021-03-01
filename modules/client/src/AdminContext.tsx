import React from "react";
import { GitState } from "./types";

export const AdminContext = React.createContext({
  newContent: "",
  editMode: false,
  gitState: {} as GitState,

  // eslint-disable-next-line
  updateAuthToken: (authToken: string) => {},
  setEditMode: (edit: boolean) => {},
  setNewContent: (newContent: string) => {},
  syncGitState: async (ref?: string, slug?: string, force?: boolean) => {},
});
