import React, { Suspense } from 'react';
import { VRCanvas, XR, Controllers, Hands } from '@react-three/xr';
import { Loader } from '@react-three/drei';
import SceneContent from './SceneContent';

const ScenePlayer = ({ mode, isAR, isVR }) => {
  return (
    <>
      <VRCanvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.6, 3], fov: 75 }}
      >
        <XR>
          <Controllers />
          <Hands />

          <Suspense fallback={null}>
            <SceneContent mode={mode} isAR={isAR} isVR={isVR} />
          </Suspense>
        </XR>
      </VRCanvas>

      <Loader />
    </>
  );
};

export default ScenePlayer;
