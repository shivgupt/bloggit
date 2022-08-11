import React, { useEffect } from "react";

import { VRCanvas, ARCanvas, useXR, useController, DefaultXRControllers, Interactive } from '@react-three/xr'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader, useGraph } from "@react-three/fiber";

export const VRHouseTour = () => {

  // Load house glb
  const glb = useLoader(GLTFLoader, `http://${window.location.host}/ipfs/QmVmQa83LRATp3KAZzwdr1eWWZZKrxmVsNXpExL5xSrt1r`);
  const { nodes, materials } = useGraph(glb.scene)
  console.log('Nodes = ', nodes)

  const { player } = useXR()

  useEffect(() => {
    player.position.x = 0;
    player.position.y = 3;
    player.position.z = 0;
  }, [])

  //console.log('Floor 1 = ', glb.scene.children["Floor1"]);
  const floor1 = glb.scene.children.find((child, index, a) => child.name === 'Floor1');

  if (!glb) return <> Loading! Please wait </>

  return (
    <div style = {{height:"100vh", width:"100%"}}>
      <VRCanvas frameloop="demand" dpr={[1, 1.5]} shadows camera={{ near: 0.1, far: 100, fov: 75 }}>
        <ambientLight intensity={0.1} />
        <Interactive onHover={() => console.log("Hovering")}>
          <mesh>
            <primitive object={glb.scene} scale={1} />
          </mesh>
        </Interactive>
        <DefaultXRControllers />
      </VRCanvas>
    </div>
  )
}
