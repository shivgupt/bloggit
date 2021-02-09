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

  // eslint-disable-next-line
  updateKey: (key: adminKeyType) => {},
});