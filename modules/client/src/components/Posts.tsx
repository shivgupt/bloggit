import Fab from "@mui/material/Fab";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Edit from "@mui/icons-material/Edit";
import Typography from "@mui/material/Typography";
import React, { useContext, useEffect, useState } from "react";
import "react-mde/lib/styles/css/react-mde-all.css";
import { useNavigate } from "react-router-dom";

import { GitContext } from "../GitContext";
import { getFabStyle } from "../style";
import { getPrettyDateString } from "../utils";

import { BrowseHistory } from "./BrowseHistory";
import { Markdown } from "./Markdown";

const StyledDiv = styled("div")(({ theme }) => ({
  maxWidth: "864px",
  width: "100%",
}))

export const PostPage = ({
  adminMode,
}: {
  adminMode: string;
}) => {
  const [isHistorical, setIsHistorical] = useState<boolean>(false);
  const [lastEdited, setLastEdited] = useState<string>("");

  const gitContext = useContext(GitContext);
  const navigate = useNavigate();

  const { currentRef, latestRef, slug, currentContent, indexEntry } = gitContext.gitState;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const anchor = document.getElementById(hash.substr(1));
      if (anchor) anchor.scrollIntoView();
    }
  },[slug]);

  const publishedOn = indexEntry?.publishedOn ? getPrettyDateString(indexEntry.publishedOn) : null;

  return (
    <StyledDiv>
      <BrowseHistory
        currentRef={currentRef}
        latestRef={latestRef}
        isHistorical={isHistorical}
        setIsHistorical={setIsHistorical}
        setLastEdited={setLastEdited}
        slug={slug}
      />

      <Paper variant="outlined" sx={{ flexGrow: 1, mt: 1, mr: 1, "& > *": { m: 1, } }}>
        { indexEntry?.img
          ? <img
            src={indexEntry.img}
            alt={indexEntry.img}
            style={{
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              display: "block",
              margin: "0 auto 16px auto",
              maxWidth: "100%",
              width: "100%",
            }}
          />
          : null
        }
        { publishedOn
          ? <Typography variant="caption" display="block"
              sx={{
                paddingLeft: "20px",
                textAlign: "justify",
                fontVariant: "discretionary-ligatures",
              }}
            >
            Published On: {publishedOn}
          </Typography>
          : null
        }
        { !isHistorical && lastEdited
          ? <Typography variant="caption" display="block"
              sx={{
                paddingLeft: "20px",
                textAlign: "justify",
                fontVariant: "discretionary-ligatures",
              }}
            >
            Last Updated: {lastEdited}
          </Typography>
          : null
        }
        <Markdown content={currentContent} />
      </Paper>
      {adminMode === "enabled" && !isHistorical
        ? <Fab
          id={"fab"}
          sx={ (theme) => getFabStyle(theme) }
          color="primary"
          onClick={() => {
            navigate(`/admin/edit/${slug}`);
          }}
        ><Edit/></Fab>
        : null
      }
    </StyledDiv>
  );
};
