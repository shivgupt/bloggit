import React, { useEffect, useState } from "react";

import { VRCanvas, ARCanvas, useXR, useController, DefaultXRControllers, Interactive } from '@react-three/xr'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader, useGraph, useFrame } from "@react-three/fiber";
import { Plane } from '@react-three/drei'
import * as THREE from "three"

export const VRHouseTour = () => {

  // Load house glb
  const glb = useLoader(GLTFLoader, `http://${window.location.host}/ipfs/QmVmQa83LRATp3KAZzwdr1eWWZZKrxmVsNXpExL5xSrt1r`);
  const { nodes, materials } = useGraph(glb.scene)

  const { player } = useXR()
  const [marker, setMarker] = useState(new THREE.Vector3(0,3,0))

  useEffect(() => {
    player.position.x = marker.x || 0;
    player.position.y = 3;
    player.position.z = marker.z || 0;
    console.log("setting player position", player)
  }, [marker])

  const floor1 = glb.scene.children.find((child, index, a) => child.name === 'Floor1');

  if (!glb) return <> Loading! Please wait </>

  const move = (event) => {
    if (event.intersection) {
      const point = event.intersection.point;
        console.log(event.intersection)
      if (event.intersection.object.uuid === floor1?.uuid || event.intersection.object.parent.uuid === floor1?.uuid)
      {
        console.log(floor1!)
        setMarker(point)
      }
      /*
      player.position.x = point.x;
      player.position.y = point.y;
      player.position.z = point.z;
      */
    }
  }

  return (
    <div style = {{height:"100vh", width:"100%"}}>
      <VRCanvas frameloop="demand" dpr={[1, 1.5]} shadows camera={{ near: 0.1, far: 100, fov: 75 }}>
        <ambientLight intensity={0.5} />
        <Interactive onSqueeze={(event) => move(event)}>
          <Plane position={marker}>
            <meshBasicMaterial color="hotpink" />
          </Plane>
          <mesh>
            <primitive object={glb.scene} scale={1} />
          </mesh>
        </Interactive>
        <DefaultXRControllers />
      </VRCanvas>
    </div>
  )
}
