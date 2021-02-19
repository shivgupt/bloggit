import {
  Container,
  CssBaseline,
  Theme,
  createStyles,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch} from "react-router-dom";
import axios from "axios";

import { Home } from "./components/Home";
import { AdminHome } from "./components/AdminHome";
import { NavBar } from "./components/NavBar";
import { PostPage } from "./components/Posts";
import { emptyIndex, fetchFile, fetchContent, fetchIndex, getPostsByCategories } from "./utils";
import { darkTheme, lightTheme } from "./style";
import { store } from "./utils/cache";
import { AdminContext } from "./AdminContext";
import { PostData, PostIndex, SidebarNode } from "./types";
import { CreateNewPost } from "./components/CreateNewPost";

const useStyles = makeStyles((theme: Theme) => createStyles({
  appBarSpacer: theme.mixins.toolbar,
  root: {
    display: "flex",
  },
  container: {
    [theme.breakpoints.up("md")]: {
      width: "80%",
      marginRight: "20%",
    },
  },
  main: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    padding: theme.spacing(0.25),
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [node, setNode] = useState({} as SidebarNode);
  const [theme, setTheme] = useState(lightTheme);
  const [index, setIndex] = useState(emptyIndex);
  const [title, setTitle] = useState({ site: "", page: "" });
  const [about, setAbout] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [adminMode, setAdminMode] = useState(true);
  const [postsContent, setPostsContent] = useState({});
  const adminContext = useContext(AdminContext);

  const match = useRouteMatch("/:slug");
  const currentSlug = match ? match.params.slug : "";

  const updateAuthToken = (authToken: string) => {
    setAuthToken(authToken);
    store.save("authToken", authToken);
  };

  const updateIndex = async (newIndex?: PostIndex, fetch?: "content" | "index" | "about", slug?: string) => {
    if (fetch) {
      switch(fetch) {
        case "content": 
          newIndex = await fetchIndex(true);
          const content = await fetchContent(slug!, true);
          const newPostsContent = JSON.parse(JSON.stringify(postsContent));
          //newIndex![key!][slug!].content = currentContent;
          newPostsContent[slug!] = content;
          setPostsContent(newPostsContent);
          break;
        case "index":
          newIndex = await fetchIndex(true);
          if (newIndex.about) {
            setAbout(await fetchFile(newIndex.about));
          }
          break;
        case "about":
          setAbout(await fetchFile(newIndex!.about));
      }
    }
    setIndex(newIndex || {} as PostIndex);
  }

  const viewAdminMode = (viewAdminMode: boolean) => setAdminMode(viewAdminMode);

  const toggleTheme = () => {
    if ( theme.palette.type === "dark") {
      store.save("theme", "light");
      setTheme(lightTheme);
    }
    else {
      store.save("theme", "dark");
      setTheme(darkTheme);
    }
  };

  useEffect(() => {
    axios.defaults.headers.common["authorization"] = `Basic ${btoa(`admin:${adminContext.authToken}`)}`;
  }, [adminContext]);

  useEffect(() => {
    (async () => updateIndex({} as PostIndex, "index"))();

    // Set theme to local preference
    const themeSelection = store.load("theme");
    if (themeSelection === "light") setTheme(lightTheme);
    else setTheme(darkTheme);

    // Check local storage for admin edit keys
    const key = store.load("authToken");
    if (key) setAuthToken(key);
  }, []);

  // Set post content if slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      // Do nothing if index isn't loaded yet or content is already loaded
      if (!(index.posts[currentSlug] || index.drafts[currentSlug]) || postsContent[currentSlug]) {
        return;
      }
      // Need to setIndex to a new object to be sure we trigger a re-render
      await updateIndex(JSON.parse(JSON.stringify(index)), "content", currentSlug);
    })();

    // Set sidebar node
    if (currentSlug !== "" && index.posts[currentSlug]){
      setNode({ parent: "posts", current: "toc", child: index.posts[currentSlug] });
    } else {
      setNode({ parent: "", current: "categories", child: "posts" });
    }

    // Update the title when the index or current post changes
    setTitle({
      site: index ? index.title : "My personal website",
      page: index.posts[currentSlug] ? index.posts[currentSlug].title : "",
    });
    document.title = title.page ? `${title.page} | ${title.site}` : title.site;

  }, [currentSlug, index]);

  return (
    <ThemeProvider theme={theme}>
      <AdminContext.Provider value={{ authToken, index, updateIndex ,updateAuthToken, adminMode, viewAdminMode }}>
        <CssBaseline />
        <NavBar
          node={node}
          setNode={setNode}
          posts={getPostsByCategories(index.posts)}
          postsContent={postsContent}
          title={title}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className={classes.main}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <Switch>
              <Route exact
                path="/"
                render={() => {
                  return (
                    <Home
                      posts={index.posts}
                      title={title}
                    />
                  );
                }}
              />
              <Route exact
                path="/about"
                render={() => {
                  return (<PostPage content={index.about ?
                    about
                    : "Not added yet" }
                  />);
                }}
              />
              <Route exact
                path="/create-new-post"
                render={() => {
                  return <CreateNewPost />;
                }}
              />
              <Route exact
                path="/admin"
                render={() => {
                  return (
                    <AdminHome />
                  );
                }}
              />
              <Route
                path="/:slug"
                render={({ match }) => {
                  const slug = match.params.slug;
                  let content = "Loading..."
                  if (postsContent[slug]) {
                    content = postsContent[slug];
                  } else if (!(index.posts[slug] || index.drafts[slug])) {
                    content = "Post Does Not Exist"
                  }
                  return (<PostPage
                    content={content}
                    slug={slug}
                  />);
                }}
              />
            </Switch>
          </Container>
        </main>
      </AdminContext.Provider>
    </ThemeProvider>
  );
};

export default App;