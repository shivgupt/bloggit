import { useTheme } from "@material-ui/core/styles";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

export const CodeBlockRenderer = (props: any) => {
  const theme = useTheme();

  if (theme.palette.type === "dark") {
    return (
      <SyntaxHighlighter showLineNumbers language={props.language} style={atomDark}>
        {props.value}
      </SyntaxHighlighter>
    );
  }

  return (
    <SyntaxHighlighter language={props.language} style={vs}>
      {props.value}
    </SyntaxHighlighter>
  );
};