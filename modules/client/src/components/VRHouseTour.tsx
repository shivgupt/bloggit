import React, { useEffect } from "react";

import { VRCanvas, ARCanvas, useXR } from '@react-three/xr'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";

export const VRHouseTour = () => {
  // Load house glb
  const glb = useLoader(GLTFLoader, `http://${window.location.host}/ipfs/QmcV7M9rLczzgncY7MjeTwJBMgEgpo5sFpbNBVQJrGXgar`);

  const { player } = useXR()

  useEffect(() => {
    player.position.x = 0;
    player.position.y = 3;
    player.position.z = 0;
  }, [])

  console.log(Object.keys(player));
  console.log(player.position);
  console.log(glb);

  return (
    <div style = {{height:"100vh", width:"100%"}}>
      <VRCanvas>
        <ambientLight intensity={0.1} />
        <spotLight position={[-1.5152270793914795, -1.5152270793914795, 5]} />
        <mesh>
          <primitive object={glb.scene} scale={1} />
        </mesh>
      </VRCanvas>
    </div>
  )
}
