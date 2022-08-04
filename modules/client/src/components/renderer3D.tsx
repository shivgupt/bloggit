import React, { useRef, useState, Suspense } from "react";

// WebGL related imports
import { Canvas, useLoader } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const Renderer3D = (src: any) => {
  console.log(typeof(src));
  const gltf = useLoader(GLTFLoader, "src");
  return (
    <div style = {{height:"100vh", width:"80vw"}}>
      <Canvas>
        <Suspense fallback={null}>
          <primitive object={gltf.scene} scale={1} />
          <OrbitControls />
          <Environment background files="DJI_0060.hdr" />
        </Suspense>
      </Canvas>
    </div>
  );
};
