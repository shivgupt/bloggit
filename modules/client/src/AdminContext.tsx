import React from "react";

export type adminKeyType = {
  id: string,
  value: string,
}

export const AdminContext = React.createContext({
  key: {
    id: "",
    value: "",
  },

  adminMode: true,

  // eslint-disable-next-line
  updateKey: (key: adminKeyType) => {},
  viewAdminMode: (viewAdminMode: boolean) => {},
});