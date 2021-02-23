import { Button, Grid, Tooltip, Typography, withStyles } from "@material-ui/core";
import { FileCopy as CopyIcon } from "@material-ui/icons";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

const style = withStyles(theme => ({
  label: {
    textTransform: "none",
  },
}));

export const Copyable = style((props: any) => {
  const [copied, setCopied] = useState(false);
  const { className, color, size, tooltip, text, value } = props;
  console.log(`Copied: ${copied}`);
  return (
    <Grid item xs={12}>
      <CopyToClipboard onCopy={() => setCopied(true)} text={value}>
        <Button
          className={className}
          disableTouchRipple
          color={color || "inherit"}
          size={size || "medium"}
          variant="contained"
        >
          <CopyIcon style={{ marginRight: "5px" }} />
          <Typography noWrap variant="body1">
            <Tooltip disableTouchListener title={tooltip || text}>
              <span>{text}</span>
            </Tooltip>
          </Typography>
        </Button>
      </CopyToClipboard>
    </Grid>
  );
});
