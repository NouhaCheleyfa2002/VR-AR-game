import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Environment, Loader } from '@react-three/drei';
import ModelLoader from './ModelLoader';

// Create XR store for AR
const store = createXRStore();

// Simple ground placer component that positions objects for AR
const GroundPlacer = ({ children }) => {
  return (
    <group position={[0, -1, -2]}>
      {children}
    </group>
  );
};

// AR Button Component
const ARButton = () => {
  const enterAR = async () => {
    try {
      await store.enterAR();
    } catch (error) {
      console.error('Failed to enter AR:', error);
    }
  };

  return (
    <button
      onClick={enterAR}
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}
    >
      Enter AR
    </button>
  );
};

const ARPreviewer = () => {
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <Canvas 
        gl={{ alpha: true }} 
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        style={{ height: '100vh', width: '100vw' }}
      >
        <XR store={store}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          <Suspense fallback={null}>
            <Environment preset="sunset" />

            {/* Assets placed on real-world plane */}
            <GroundPlacer>
              <ModelLoader
                path="/models/Arch Door.glb"
                position={[0, 0, 0]}
                scale={0.5}
              />
              <ModelLoader
                path="/models/Arch.glb"
                position={[2, 0, -3]}
                scale={0.5}
              />
              <ModelLoader
                path="/models/Banner Wall.glb"
                position={[-1, 0, 1]}
                scale={0.2}
              />
              <ModelLoader
                path="/models/Banner.glb"
                position={[1, 0, 2]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Barrel.glb"
                position={[-2, 0, 1]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Bricks.glb"
                position={[-1, 0, -1]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Bucket.glb"
                position={[0, 0, -2]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Chair.glb"
                position={[3, 0, 0]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Chest with Gold.glb"
                position={[-3, 0, -1]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Chest.glb"
                position={[2, 0, 3]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Cobweb.glb"
                position={[-2, 0, -3]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Coin Bag.glb"
                position={[4, 0, 1]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Coin Piles.glb"
                position={[-4, 0, 0]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Column-6y1EFzpRI9.glb"
                position={[0, 0, 4]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Column.glb"
                position={[-1, 0, 4]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Crate.glb"
                position={[3, 0, -2]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Floor Tile.glb"
                position={[-3, 0, 2]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Horse Statue.glb"
                position={[0, 0, -4]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Pedestal-VE1kTjVgJf.glb"
                position={[2, 0, -4]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Skull.glb"
                position={[-2, 0, 4]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Small Table.glb"
                position={[4, 0, -1]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Sword Wall Mount.glb"
                position={[-4, 0, -2]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Table Big.glb"
                position={[1, 0, -4]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Torch.glb"
                position={[-1, 0, -4]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Trap Door.glb"
                position={[4, 0, 2]}
                scale={0.3}
              />
              <ModelLoader
                path="/models/Wall Modular.glb"
                position={[-4, 0, 1]}
                scale={0.3}
              />
            </GroundPlacer>
          </Suspense>
        </XR>
      </Canvas>

      <ARButton />
      <Loader />
    </div>
  );
};

export default ARPreviewer;