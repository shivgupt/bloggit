import React, { useState, useEffect } from "react";
import { TextField } from "@material-ui/core";

export const ProfileEdit = (props: any) => {
  const { handleEditProfile, profile } = props
  return (
    <>
      <TextField
        id="name"
        label="Profile Name"
        defaultValue={profile.name || "Stranger"}
        onChange={handleEditProfile}
        margin="normal"
        variant="outlined"
      />
      <TextField
        id="age"
        label="Age"
        defaultValue={profile.age || "0"}
        onChange={handleEditProfile}
        margin="normal"
        variant="outlined"
      />
      <TextField
        id="height"
        label="Height"
        defaultValue={profile.height || "5ft"}
        onChange={handleEditProfile}
        margin="normal"
        variant="outlined"
      />
    </>
  )
}
