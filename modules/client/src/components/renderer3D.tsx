import React, { useRef, useState, Suspense } from "react";

// WebGL related imports
import { Canvas, useLoader } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const Renderer3D = (src: any) => {
  console.log(src)
  let srcURL = `http://${window.location.host}${src.src}`;
  /*
  const loader = new GLTFLoader();
  loader.load("https://arweave.net/8kWTyLavFfivf3uhtyWiCa8VQ6M8R7XHP3ed991NrLA", (gltf) => {
    console.log(gltf);
  }, undefined, (error) => {
    console.log( error );
  });
  */

  const arweaveSrc = "https://arweave.net/8kWTyLavFfivf3uhtyWiCa8VQ6M8R7XHP3ed991NrLA";
  const gltf = useLoader(GLTFLoader, srcURL);
    console.log("This is the gltf", gltf);

  return (
    <div style = {{height:"100vh", width:"100%"}}>
      <Canvas>
        <Suspense fallback={null}>
          <primitive object={gltf.scene} scale={1} />
          <OrbitControls />
          <Environment preset="sunset" background />
        </Suspense>
      </Canvas>
    </div>
  );
};

/*
  <Environment background files="DJI_0060.hdr" />
 */
