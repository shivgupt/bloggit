import { Button, Tooltip, Typography, withStyles } from "@material-ui/core";
import CopyIcon from '@material-ui/icons/Link';
import CopiedIcon from '@material-ui/icons/AssignmentTurnedIn';
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

const style = withStyles(theme => ({
  label: {
    textTransform: "none",
  },
}));

export const Copyable = style((props: any) => {
  const [copied, setCopied] = useState(false);
  const { className, color, id, size, tooltip, text, value } = props;
  return (
    <CopyToClipboard
      onCopy={() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      text={value}
    >
      <Tooltip arrow title={tooltip || text}>
        <Button
          className={className}
          color={color || "inherit"}
          id={id}
          size={size || "medium"}
          variant="contained"
        >
          {copied
            ? <CopiedIcon style={{ marginRight: "5px" }} />
            : <CopyIcon style={{ marginRight: "5px" }} />
          }
          <Typography noWrap variant="button">
            {text}
          </Typography>
        </Button>
      </Tooltip>
    </CopyToClipboard>
  );
});
