import React, { useRef, useState, Suspense } from "react";

// WebGL related imports
import { Canvas, useLoader } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const Renderer3D = (src: any) => {
  console.log(src)
  let srcURL = `${window.location.origin}${src.src}`;

  const gltf = useLoader(GLTFLoader, srcURL);

  return (
    <div style = {{height:"100vh", width:"100%"}}>
      <Canvas>
        <Suspense fallback={null}>
          <primitive object={gltf.scene} scale={.3} />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
};

/*
  <Environment background files="DJI_0060.hdr" />
 */
