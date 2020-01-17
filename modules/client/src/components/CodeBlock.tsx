import React from 'react';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Theme,
  createStyles,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
  table: {
    minWidth: 400,
  },
}),);

export const CodeBlockRenderer = (props: any) => {
  const classes = useStyles();
  return (
    <Paper variant="outlined">
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableBody>
          <TableRow>
           <TableCell>
             <SyntaxHighlighter language={props.language} style={coy}>
                {props.value}
              </SyntaxHighlighter>
           </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}
