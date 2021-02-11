import React from "react";

export const AdminContext = React.createContext({
  authToken: "",

  adminMode: true,

  // eslint-disable-next-line
  updateAuthToken: (authToken: string) => {},
  viewAdminMode: (viewAdminMode: boolean) => {},
});