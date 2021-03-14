import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import PhotoLibrary from "@material-ui/icons/PhotoLibrary";
import React from "react";
import axios from "axios";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing(1)
  },
  input: {
    display: "none"
  },
}));

export const ImageUploader = ({
  setImageHash,
}: {
  setImageHash: (val: string) => void;
}) => {
  const classes = useStyles();

  const handleImageUpload = (event) => {
    console.log(event);
    const reader = new FileReader();
    let file = event.target.files[0];
    reader.readAsArrayBuffer(file);
    reader.onloadend = async () => {
      let res = await axios({
        method: "POST",
        url: "ipfs",
        data: reader.result,
        headers: { "content-type": "multipart/form-data"}
      });
      if (res.status === 200) {
        setImageHash(res.data);
      } else {
        console.log(res);
      }
    }
  }

  return (
    <div className={classes.container}>
      <input
        id="image-uploader"
        accept="image/*"
        className={classes.input}
        type="file"
        onChange={handleImageUpload}
      />
      <label htmlFor="image-uploader">
        <IconButton component="span">
          <PhotoLibrary />
        </IconButton>
      </label>
    </div>
  );
};
