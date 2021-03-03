import { Button, Tooltip, Typography, withStyles } from "@material-ui/core";
import { FileCopy as CopyIcon, Done as CopiedIcon } from "@material-ui/icons";
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
  return (
    <CopyToClipboard onCopy={() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }} text={value}>
      <Button
        className={className}
        color={color || "inherit"}
        size={size || "medium"}
        variant="contained"
      >
        {copied
          ? <CopiedIcon style={{ marginRight: "5px" }} />
          : <CopyIcon style={{ marginRight: "5px" }} />
        }
        <Typography noWrap variant="body1">
          <Tooltip arrow disableTouchListener title={tooltip || text}>
            <span>{copied ? "Copied" : text}</span>
          </Tooltip>
        </Typography>
      </Button>
    </CopyToClipboard>
  );
});
