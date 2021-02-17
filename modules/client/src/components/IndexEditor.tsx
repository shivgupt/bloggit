import React, { useContext, useEffect, useState } from "react";
import { 
  Button,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";

import { AdminContext } from "../AdminContext";
import { PostData } from "../types";
import { Drafts, ExpandLess, ExpandMore, Public } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  listText: {
    maxWidth: "60%"
  },
  section: {
    margin: theme.spacing(1, 1),
    "& > *": {
      margin: theme.spacing(1),
    }
  },
}));


export const IndexEditor = (props: any) => {

const adminContext = useContext(AdminContext);
const [index, setIndex] = useState(adminContext.index);
const [openPosts, setOpenPosts] = useState(false);
const [openDrafts, setOpenDrafts] = useState(false);

const classes = useStyles();
const togglePosts = () => setOpenPosts(!openPosts);
const toggleDrafts = () => setOpenDrafts(!openDrafts);

useEffect(() => setIndex(adminContext.index), [adminContext]);

return (
  <List className={classes.root}>
    <ListItem key="index_title">
      <TextField id="index_title" label="title" defaultValue={index.title} />
    </ListItem>
    <ListItem key="index_posts">
      <ListItemText primary="Posts" onClick={togglePosts} />
      {openPosts ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
    <Collapse in={openPosts} timeout="auto" unmountOnExit>
      <List>
      {Object.values(index.posts).map((post) => {
        return (
          <ListItem key={post.slug} alignItems="flex-start">
            <ListItemText primary={post.title} className={classes.listText} />
            <ListItemSecondaryAction>
              <Button size="small" color="primary" variant="contained" startIcon={<Drafts />}>
                Archive
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        )
      })}
      </List>
    </Collapse> 
    <ListItem key="index_drafts">
      <ListItemText primary="Drafts" onClick={toggleDrafts} />
      {openDrafts ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
    <Collapse in={openDrafts} timeout="auto" unmountOnExit>
      <List>
      {index.drafts
       ? Object.values(index.drafts).map((draft) => {
          return (
            <ListItem key={draft.slug} alignItems="flex-start">
              <ListItemText primary={draft.title} className={classes.listText} />
              <ListItemSecondaryAction>
                <Button size="small" color="primary" variant="contained" startIcon={<Public />}>
                  Publish
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })
        : null
      }
      </List>
    </Collapse> 
  </List>
  );
}
  //   return (<>{
  //     Object.entries(adminContext.index).map(([key,value]) => { 
  //     switch(typeof(value)) {
  //       case 'string':
  //         console.log('string');
  //         return <TextField
  //           id={"key" + key}
  //           key={key}
  //           label={key}
  //           variant="outlined"
  //           defaultValue={value}
  //         />
          
  //       case 'object':
  //         console.log(value);
  //         if (value && (value as Array<any>).length ) {
  //           const val = (value as Array<any>).reduce((v, o) =>  v + o + "\n", "");
  //           return <TextField 
  //                 key={key}
  //                 label={key}
  //                 multiline
  //                 defaultValue={val}
  //             />
  //           } else {
  //            //return <Typography key={key}>Processing Key: {key}</Typography> //<JsonEditor root={value} />
  //           return (
  //             <>
  //               <Typography variant="subtitle2">
  //                 {key}
  //               </Typography>
  //               <JsonEditor root={value} />
  //             </>
  //           )
  //         }
          
  //       default:
  //         return <Typography key={key}> Unknown {key} {typeof(value)}</Typography>
  //     }})
  //   }</>);
  // };
