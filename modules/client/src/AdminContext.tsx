import React from "react";
import { PostIndex } from "./types";

export const AdminContext = React.createContext({
  authToken: "",
  adminMode: true,
  index: {} as PostIndex,

  // eslint-disable-next-line
  updateAuthToken: (authToken: string) => {},
  viewAdminMode: (viewAdminMode: boolean) => {},
  syncRef: async (ref?: string, slug?: string) => {},
});
