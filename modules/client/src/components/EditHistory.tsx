import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Link } from "react-router-dom";
import ExpandIcon from '@material-ui/icons/ExpandMore';

import { PostHistory } from "../types";
import { fetchHistory } from "../utils";

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
  },
})((props: any) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

export const EditHistory = (props: { className: any; gitRef: string; slug: string; }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [history, setHistory] = React.useState([] as PostHistory);

  const { gitRef: ref, slug } = props;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getHandleClick = (commit: string) => (event) => {
    console.log(`CLICK ON ${commit}!!`);
    handleClose();
  };

  React.useEffect(() => {
    (async () => {
      setHistory(await fetchHistory(slug, ref));
    })();
  }, [ref, slug]);

  return (
    <div>
      <Button
        className={props.className}
        startIcon={<ExpandIcon/>}
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleOpen}
      >
        Browse Edit History
      </Button>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={handleClose}
      >
        {
          history.map(entry => {
            if (entry.commit.substring(0,8) === ref) return null;
            return (
              <MenuItem
                key={entry.commit}
                component={Link}
                to={`/${entry.commit.substring(0, 8)}/${slug}`}
                onClick={getHandleClick(entry.commit)}
              >
                <ListItemText primary={(new Date(entry.timestamp)).toLocaleString()} />
              </MenuItem>
            );
          })
        }
      </StyledMenu>
    </div>
  );
}
