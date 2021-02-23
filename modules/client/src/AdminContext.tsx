import React from "react";
import { PostIndex } from "./types";

export const AdminContext = React.createContext({
  authToken: "",
  adminMode: true,
  newContent: "",
  index: {} as PostIndex,

  // eslint-disable-next-line
  updateAuthToken: (authToken: string) => {},
  updateNewContent: (newContent: string) => {},
  viewAdminMode: (viewAdminMode: boolean) => {},
  syncRef: async (ref?: string, slug?: string, force?: boolean) => {},
});
