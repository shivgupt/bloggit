import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import IconButton from "@material-ui/core/IconButton";
import Input from '@material-ui/core/Input';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from "@material-ui/core/styles";
import Close from "@material-ui/icons/Close";
import Crop from "@material-ui/icons/Crop";
import PhotoLibrary from "@material-ui/icons/PhotoLibrary";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  cropContainer: {
    paddingBottom: theme.spacing(2),
  },
  previewContainer: {
    marginTop: theme.spacing(8),
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

export const ImageInput = ({
  imageUrl,
  setImageUrl,
}: {
  imageUrl: string,
  setImageUrl: (val: string) => void;
}) => {
  const classes = useStyles();

  const [mode, setMode] = useState<"none" | "crop" | "uploading">("none");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [croppedImage, setCroppedImage] = useState<any>();
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState<number>(1);

  // Bubble all changes up via provided callback (and ignore updates to provided callback fn)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setImageUrl(imageUrl), [imageUrl]);

  const handleImageUpload = (event) => {
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      console.log("Image reader done loading:", reader.result);
      setImageDataUrl(reader.result as string);
      setMode("crop");
    }
  };

  const onCropComplete = async (croppedArea, croppedAreaPixels) => {
    console.log("New cropped area:", croppedArea, croppedAreaPixels)
    setCropArea(croppedAreaPixels);
  };

  const uploadImage = async () => {
    if (!croppedImage) return;
    console.log(`Uploading image..`);
    setMode("uploading");
    let res = await axios({
      method: "POST",
      url: "ipfs",
      data: croppedImage,
      headers: { "content-type": "multipart/form-data"}
    });
    if (res.status === 200) {
      setImageUrl(res.data);
    } else {
      console.log(res);
    }
    await new Promise(res => setTimeout(res, 20000)); // pause to help debug the image preview
    setMode("none");
  };

  // create the image with a src of the base64 string
  const createImage = (url): Promise<any> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', error => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const skipCrop = async () => {
    console.log(`Skipping Crop..`);
    const image = await createImage(imageDataUrl)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!;
    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      console.log(`Got cropped image blob`);
      setCroppedImage(blob);
      uploadImage();
    }, 'image/png');
  };

  const performCrop = async () => {
    console.log(`Performing Crop..`);
    const image = await createImage(imageDataUrl)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!;
    canvas.width = cropArea.width
    canvas.height = cropArea.height
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
    canvas.toBlob((blob) => {
      console.log(`Got cropped image blob`);
      setCroppedImage(blob);
      uploadImage();
    }, 'image/png')
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
              startIcon={<Close/>}
              variant="outlined"
            >Skip</Button>
          </Toolbar>
        </AppBar>
        {mode === "crop"
          ? <div className={classes.cropContainer}>
              <Cropper
                image={imageDataUrl}
                crop={crop}
                zoom={zoom}
                aspect={4/3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          : <div className={classes.previewContainer}>
              <Typography>Uploading image to IPFS..</Typography>
              <img src={imageDataUrl} alt="preview"/>
            </div>
        }
      </Dialog>
    </>
  );
};
