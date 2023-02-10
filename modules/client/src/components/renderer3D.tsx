import React, { useRef, useState, useEffect, Suspense } from "react";

// WebGL related imports
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { EngineOptions } from "@babylonjs/core/Engines/thinEngine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene, SceneOptions } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3, CubeTexture, StandardMaterial, Texture } from "@babylonjs/core";

export const Renderer3D = (props: {
  onRender?: (scene: Scene) => void,
  onSceneReady: (scene: Scene) => void,
  src: string,
} & React.CanvasHTMLAttributes<HTMLCanvasElement>) => {

  const {
    onSceneReady, onRender, src, ...rest
  } = props;

  const reactCanvas = useRef(null);

  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(canvas, false, { adaptToDeviceRatio: true }, false)
    const scene = new Scene(engine, {});

    const camera = new ArcRotateCamera(
      "viewCamera", 0, 0, 3, new Vector3(0, 0, 0), scene
    );
    camera.attachControl(true);
    // camera.minZ = 0.1;

    const light = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
    // light.intensity = 2;

    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene: Scene) => {
        onSceneReady(scene);
      })
    }
    engine.runRenderLoop(() => {
      if (typeof onRender === "function")
        onRender(scene);
      scene.render(true);
    });

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();
      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [onSceneReady, onRender, src])

  return <canvas ref={reactCanvas} {...rest} />;
  // let srcURL = `${window.location.origin}${src.src}`;

  // const gltf = useLoader(GLTFLoader, srcURL);

  // return (
  //   <div style = {{height:"100vh", width:"100%"}}>
  //     <Canvas>
  //       <Suspense fallback={null}>
  //         <primitive object={gltf.scene} scale={.3} />
  //         <OrbitControls />
  //         <Environment preset="sunset" background />
  //       </Suspense>
  //     </Canvas>
  //   </div>
  // );
};

/*
  <Environment background files="DJI_0060.hdr" />
 */
