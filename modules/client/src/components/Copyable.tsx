import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import CopiedIcon from "@material-ui/icons/AssignmentTurnedIn";
import CopyIcon from "@material-ui/icons/Link";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

const useStyles = makeStyles(theme => ({
  label: {
    textTransform: "none",
  },
}));

export const Copyable = ({
  color,
  id,
  size,
  text,
  tooltip,
  value,
}: {
  color?: "default" | "inherit" | "primary" | "secondary",
  id: string,
  size: "medium" | "large" | "small",
  text: string,
  tooltip?: string,
  value: string,
}) => {
  const [copied, setCopied] = useState(false);
  const classes = useStyles();

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
          className={classes.label}
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
};
