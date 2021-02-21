import React from "react";
import { PostIndex } from "./types";

export const AdminContext = React.createContext({
  authToken: "",
  adminMode: true,
  index: {} as PostIndex,

  // eslint-disable-next-line
  updateAuthToken: (authToken: string) => {},
  viewAdminMode: (viewAdminMode: boolean) => {},
  updateIndex: async (newIndex?: PostIndex, fetch?: string, slug?: string, ref?: string) => {},
});
