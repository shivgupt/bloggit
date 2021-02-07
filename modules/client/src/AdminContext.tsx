import React from "react";

export const AdminContext = React.createContext({
  key: {
    id: "",
    pub: "",
    priv: ""
  },
});