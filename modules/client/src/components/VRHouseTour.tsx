import React, { useEffect } from "react";

import { VRCanvas, ARCanvas, useXR } from '@react-three/xr'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";

export const VRHouseTour = () => {
  // Load house glb
  const glb = useLoader(GLTFLoader, `http://${window.location.host}/ipfs/QmcV7M9rLczzgncY7MjeTwJBMgEgpo5sFpbNBVQJrGXgar`);

  const { player } = useXR()

  console.log(JSON.stringify(player, null, 2));
  console.log(JSON.stringify(player.position, null, 2));
  /*
  useEffect(() => {
    player.position.z += 0.1
  }, []);
  */

  return (
    <div style = {{height:"100vh", width:"100%"}}>
      <VRCanvas>
        <ambientLight intensity={0.5} />
        <mesh>
          <primitive object={glb.scene} scale={1} />
        </mesh>
      </VRCanvas>
    </div>
  )
}
