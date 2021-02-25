import React from "react";
import { GitState } from "./types";

export const AdminContext = React.createContext({
  authToken: "",
  adminMode: true,
  newContent: "",
  editMode: false,
  gitState: {} as GitState,

  // eslint-disable-next-line
  updateAuthToken: (authToken: string) => {},
  setEditMode: (edit: boolean) => {},
  setNewContent: (newContent: string) => {},
  setAdminMode: (viewAdminMode: boolean) => {},
  syncGitState: async (ref?: string, slug?: string, force?: boolean) => {},
});
