import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/material/styles";
import Close from "@mui/icons-material/Close";
import Crop from "@mui/icons-material/Crop";
import CropFree from "@mui/icons-material/CropFree";
import PhotoLibrary from "@mui/icons-material/PhotoLibrary";
import axios from "axios";
import React, { useState } from "react";
import Cropper from "react-easy-crop";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  cropContainer: {
    paddingBottom: theme.spacing(2),
  },
  previewTitle: {
    margin: theme.spacing(2),
  },
  previewImage: {
    maxWidth: "700px",
    width: "100%",
  },
  previewContainer: {
    marginTop: theme.spacing(8),
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "100%",
  },
  formControl: {
    margin: theme.spacing(1)
  },
  input: {
    display: "none"
  },
  cropButton: {
    color: "white",
    margin: theme.spacing(1),
  },
  cropToolbar: {
    justifyContent: "center",
  },
}));

type CropVal = { x: number; y: number; };
type CropArea = CropVal & { width: number; height: number; };

export const ImageInput = ({
  imageUrl,
  setImageUrl,
}: {
  imageUrl: string,
  setImageUrl: (val: string) => void;
}) => {
  const [mode, setMode] = useState<"none" | "crop" | "uploading">("none");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [crop, setCrop] = useState<CropVal>({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const classes = useStyles();

  const aspect = 2/1;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setMode("crop");
    };
  };

  const reset = () => {
    setMode("none");
    setPreviewImage("");
  };

  const uploadImage = async (data) => {
    const res = await axios({
      method: "POST",
      url: "/ipfs",
      data,
      headers: { "content-type": "application/octet-stream" }
    });
    if (res.status === 200) {
      setImageUrl(res.data);
    } else {
      console.error(res);
    }
    await new Promise(res => setTimeout(res, 1000)); // pause to show off image preview
    reset();
  };

  // Inspired by https://dev.to/shaerins/cropping-and-resizing-images-in-react-360a
  // create the image with a src of the base64 string
  const createImage = (url): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", error => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const skipCrop = async () => {
    setMode("uploading");
    setPreviewImage(imageDataUrl);
    await uploadImage(await (await fetch(imageDataUrl)).arrayBuffer());
  };

  const performCrop = async () => {
    setMode("uploading");
    const image = await createImage(imageDataUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    setPreviewImage(canvas.toDataURL());
    canvas.toBlob(uploadImage);
  };

  return (
    <>
      <Input
        autoComplete={"off"}
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        endAdornment={
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
        }
      />
      <Dialog
        fullScreen
        open={mode !== "none"}
      >
        <AppBar>
          <Toolbar className={classes.cropToolbar}>
            <Button
              className={classes.cropButton}
              disabled={mode !== "crop"}
              onClick={performCrop}
              startIcon={<Crop/>}
              variant="outlined"
            >Crop</Button>
            <Button
              className={classes.cropButton}
              disabled={mode !== "crop"}
              onClick={skipCrop}
              startIcon={<CropFree/>}
              variant="outlined"
            >Skip</Button>
            <Button
              className={classes.cropButton}
              disabled={mode !== "crop"}
              onClick={reset}
              startIcon={<Close/>}
              variant="outlined"
            >Cancel</Button>
          </Toolbar>
        </AppBar>
        {mode === "crop"
          ? <div className={classes.cropContainer}>
            <Cropper
              image={imageDataUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={(area, pixels) => setCropArea(pixels)}
              onZoomChange={setZoom}
            />
          </div>
          : mode === "uploading"
            ? <div className={classes.previewContainer}>
              {previewImage
                ? <>
                  <Typography align="center" display="block" variant="h6" className={classes.previewTitle}>
                        Uploading image to IPFS..
                  </Typography>
                  <img
                    alt="preview"
                    className={classes.previewImage}
                    crossOrigin="anonymous"
                    src={previewImage}
                  />
                </>
                : <Typography align="center" display="block" variant="h6" className={classes.previewTitle}>
                      Generating image...
                </Typography>
              }
            </div>
            : <Typography align="center" display="block" variant="h6" className={classes.previewTitle}>
                Cancelling...
            </Typography>
        }
      </Dialog>
    </>
  );
};
