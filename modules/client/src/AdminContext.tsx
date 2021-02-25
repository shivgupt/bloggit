import React from "react";
import { PostIndex } from "./types";

export const AdminContext = React.createContext({
  authToken: "",
  adminMode: true,
  newContent: "",
  editMode: false,
  index: {} as PostIndex,

  // eslint-disable-next-line
  updateAuthToken: (authToken: string) => {},
  setEditMode: (edit: boolean) => {},
  setNewContent: (newContent: string) => {},
  setAdminMode: (viewAdminMode: boolean) => {},
  syncRef: async (ref?: string, slug?: string, force?: boolean) => {},
});
