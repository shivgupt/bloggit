import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { styled, useTheme } from "@mui/material/styles";
import LinkIcon from "@mui/icons-material/Link";
import { ArcRotateCamera, Scene, SceneLoader } from "@babylonjs/core";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF";
import React, { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import gfm from "remark-gfm";

import { GitContext } from "../GitContext";
import { getChildValue, replaceEmojiString, slugify } from "../utils";

import { Renderer3D } from "./renderer3D";
import { HashLink } from "./HashLink";

import { fetchMediaType } from "../utils";

SceneLoader.RegisterPlugin(new GLTFFileLoader());

const StyledReactMarkdown = styled(ReactMarkdown)(({ theme }) => ({
    padding: "20px",
    textAlign: "justify",
    fontVariant: "discretionary-ligatures",
    "& > blockquote": {
      padding: `0 ${theme.spacing(2)}px`, 
      borderLeft: `${theme.spacing(0.5)}px solid ${theme.palette.divider}`,
      marginLeft: 0,
    },
    "& p > img": {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    "& p > img + em": {
      display: "block",
      maxWidth: "80%",
      marginTop: theme.spacing(-3),
      marginRight: "auto",
      marginBottom: theme.spacing(4),
      marginLeft: "auto",
    },
}));

export const Markdown = ({
  content,
}: {
  content: string;
}) => {
  const [imgErrors, setImgErrors] = useState({});
  const [vidErrors, setVidErrors] = useState({});
  const theme = useTheme();

  useEffect(() => {
    console.log(`Got image errors`, imgErrors);
  }, [imgErrors]);

  useEffect(() => {
    console.log(`Got video errors`, vidErrors);
  }, [vidErrors]);

  const ImageRenderer = ({
    node,
  }: {
    node?: any;
  }) => {
    const [src, setSrc] = useState(node.properties.src);
    const [renderType, setRenderType] = useState("");
    useEffect(() => {
      (async () => {
        const mediaType = await fetchMediaType(node.properties.src);
        setRenderType(mediaType);
      })()
    }, []);

    if (renderType === "model/gltf-binary") {
      const onSceneReady = (scene: Scene, src: any) => {
        (async () => {
          if (!scene) return;

          try { 
            const container = await SceneLoader.LoadAssetContainerAsync(
              src, "", scene, undefined, ".glb"
            );
            if (container) {
              container.addAllToScene();
            }
          } catch (e) {
            console.log(`Cannot load glb got Error`, e)
          }
        })();
      }
      return <Renderer3D src={node.properties.src} onSceneReady={onSceneReady} style={{ maxWidth: "90%" }} />
    } else if (renderType.slice(0,5) === "video") {
        return <video
          onError={() => {
            if (!vidErrors[src]) {
              setVidErrors(old => ({ ...old, [src]: true }));
            }
          }}
          controls
          src={src}
          style={{ display: "block", margin: "auto", maxWidth: "90%" }}
        />
    } else if(renderType.slice(0,5) === "image"){
      return <img
        onError={() => {
          if (!imgErrors[src]) {
            setImgErrors(old => ({ ...old, [src]: true }));
          }
        }}
        src={src}
        alt={node.properties.alt}
        style={{ display: "block", margin: "auto", maxWidth: "90%" }}
      />
    }
  };

  const LinkRenderer = ({
    node,
  }: {
    node: any;
  }) => {
    return (
      <Link
        color="secondary"
        underline="hover"
        href={node.properties.href}
      >
        {getChildValue(node)}
      </Link>
    );
  };

  const CodeBlockRenderer = ({
    children,
    className,
    inline,
    node,
  }: {
    children: any[];
    className?: string;
    inline?: boolean
    node: any;
  }) => {
    const match = /language-(\w+)/.exec(className || "");
    if (inline) {
      return (
        <code className={className}>{getChildValue(node.children[0])}</code>
      );
    } else {
      return (
        <SyntaxHighlighter
          style={theme.palette.mode === "dark" ? atomDark : vs}
          language={match ? match[1] : "text"}
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }
  };

  const HeadingRenderer = ({
    level,
    node,
  }: {
    level: number;
    node: any;
  }) => {
    const { currentRef, slug } = useContext(GitContext).gitState;
    const value = getChildValue(node);
    if (!value) {
      console.warn(`Heading node has no child value`, node);
      return null;
    }
    const hashlinkSlug = slugify(value);
    const Heading = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return (<>
      <Heading id={hashlinkSlug} style={{ marginTop: "-65px", paddingTop: "65px" }}>
        {value}
        <IconButton
          color="secondary"
          component={HashLink as any}
          edge="start"
          style={{ marginLeft: "2px" }}
          key={hashlinkSlug}
          title="Link to position on page"
          to={`/${currentRef ? `${currentRef}/` : ""}${slug}#${hashlinkSlug}`}
        >
          <LinkIcon />
        </IconButton>
      </Heading>
    </>);
  };

  return (
    <StyledReactMarkdown
      components={{
        a: LinkRenderer,
        code: CodeBlockRenderer,
        h1: HeadingRenderer,
        h2: HeadingRenderer,
        h3: HeadingRenderer,
        h4: HeadingRenderer,
        h5: HeadingRenderer,
        h6: HeadingRenderer,
        img: ImageRenderer,
      }}
      remarkPlugins={[gfm]}
    >
      {replaceEmojiString(content)}
    </StyledReactMarkdown>
  );
};
