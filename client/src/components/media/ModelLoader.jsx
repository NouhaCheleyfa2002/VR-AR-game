import React from 'react';
import { useGLTF } from '@react-three/drei';

const ModelLoader = ({ path, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) => {
  const { scene } = useGLTF(path);
  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

export default ModelLoader;
