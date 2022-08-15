import Button from "@mui/material/Button";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FastForward from "@mui/icons-material/FastForward";
import Grid from "@mui/material/Grid";
import ListItemText from "@mui/material/ListItemText";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { HistoryResponse, HistoryResponseEntry } from "@bloggit/types";
import { styled } from "@mui/material/styles";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchHistory, getPrettyDateString } from "../utils";

import { Copyable } from "./Copyable";

const StyledMenu = styled(({ className, ...props }: MenuProps) => (
  <Menu {...props} classes={{ paper: className }} />
))`
    & .MuiMenu-paper {
      border: "1px solid #d3d4d5",
      maxHeight: "50%",
    }
`;

export const BrowseHistory = ({
  currentRef,
  isHistorical,
  latestRef,
  setIsHistorical,
  setLastEdited,
  slug,
}: {
  currentRef: string;
  isHistorical: boolean;
  latestRef: string;
  setIsHistorical: (val: boolean) => void;
  setLastEdited: (val: string) => void;
  slug: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<any>(null); // TODO: provide type?
  const [editHistory, setEditHistory] = useState<HistoryResponse>([]);

  useEffect(() => {
    if (currentRef) {
      setIsHistorical(true);
    } else {
      setIsHistorical(false);
    }
  // I don't think state setters (ie setIsHistorical) should be included as a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestRef, currentRef]);

  useEffect(() => {
    if (!slug || slug === "admin") return;
    let unmounted = false;
    (async () => {
      try {
        console.log(`Refreshing history: slug="${slug}" | latestRef="${latestRef}"`);
        const allHistory = (await fetchHistory(slug));

        // Save the date of the most recent edit
        setLastEdited(getPrettyDateString(allHistory[0].timestamp) || "");

        // Discard the most recent edit bc it's the current version
        const history = allHistory.slice(1);

        // Consolidate same-day edits
        const filteredHistory = {} as { [date: string]: HistoryResponseEntry };
        history.forEach(entry => {
          const date = entry.timestamp.split("T")[0];
          if (!filteredHistory[date] || filteredHistory[date].timestamp < entry.timestamp) {
            filteredHistory[date] = entry;
          }
        });

        if (!unmounted) {
          setEditHistory(
            Object.values(filteredHistory)
              .sort((h1, h2) => h1.timestamp < h2.timestamp ? 1 : -1) as HistoryResponse
          );
        }
      } catch (e) {
        console.warn(e.message);
      }
    })();
    return () => { unmounted = true; };
  // Ignore dependency on setLastEdited
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestRef, slug]);

  return (
    <Grid container spacing={1} sx={{ mt: 1, pl: 1, }}>

      <Grid item>
        <Copyable
          id="copy-permalink"
          color="primary"
          size={"medium"}
          text="Permalink"
          tooltip="Snapshot of this page that will never change or disappear"
          value={`${window.location.origin}/${currentRef}/${slug}`}
        />
      </Grid>

      {editHistory.length > 0
        ? <Grid item>
          <Button
            id="open-history"
            startIcon={<ExpandMore/>}
            aria-haspopup="true"
            variant="contained"
            size={"medium"}
            color="primary"
            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
              setAnchorEl(event.currentTarget);
            }}
          >
            <Typography noWrap variant="button">
                History
            </Typography>
          </Button>
        </Grid>
        : null
      }

      {isHistorical
        ? <Grid item>
          <Tooltip arrow placement="bottom" title="Go to latest version">
            <Button
              color="primary"
              component={Link}
              id="jump-to-present"
              size={"medium"}
              to={`/${slug}`}
              variant="contained"
            >
              <FastForward/>
            </Button>
          </Tooltip>
        </Grid>
        : null
      }

      <StyledMenu
        elevation={0}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {
          editHistory.map((entry, i) => {
            const commit = entry.commit.substring(0,8);
            const key = `history-entry-${i+1}`;
            return (
              <MenuItem
                component={Link}
                id={key}
                key={key}
                onClick={() => setAnchorEl(null)}
                selected={commit === currentRef}
                to={`/${commit}/${slug}`}
              >
                <ListItemText primary={getPrettyDateString(entry.timestamp)} />
              </MenuItem>
            );
          })
        }
      </StyledMenu>

    </Grid>
  );
};
