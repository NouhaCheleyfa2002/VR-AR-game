import React, { Suspense, useState } from 'react';
import { Canvas} from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';


// Simple Model Loader component
const ModelLoader = ({ path, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) => {
  try {
    const { scene } = useGLTF(path);
    
    // Clone the scene to avoid issues with multiple instances
    const clonedScene = scene.clone();
    
    return (
      <primitive 
        object={clonedScene} 
        position={position} 
        scale={scale} 
        rotation={rotation}
        castShadow
        receiveShadow
      />
    );
  } catch (error) {
    // Fallback to a simple cube if model fails to load
    return (
      <mesh position={position} scale={scale} rotation={rotation} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    );
  }
};

// Simple environment lighting setup without Environment component
const SceneLighting = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ff6b35" />
    </>
  );
};

// VR Controller simulation (for non-VR testing)
const VRController = ({ position, color }) => {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.05, 0.05, 0.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const DungeonScene = () => {
  const [vrMode, setVrMode] = useState(false);
  
  const enterVR = async () => {
    try {
      if (navigator.xr) {
        const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
        if (isSupported) {
          setVrMode(true);
          console.log('VR mode activated');
        } else {
          console.log('VR not supported, using desktop mode');
        }
      } else {
        console.log('WebXR not available, using desktop mode');
      }
    } catch (error) {
      console.error('Failed to enter VR:', error);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#000' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 8], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneLighting />

        {/* Scene content */}
        <Suspense fallback={null}>
          {/* Dungeon models with fallback cubes */}
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

          {/* Walkable ground plane with stone texture */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial 
              color="#2a2a2a" 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* VR Controllers (for visualization) */}
          {vrMode && (
            <>
              <VRController position={[-0.3, 1.5, -0.5]} color="#007bff" />
              <VRController position={[0.3, 1.5, -0.5]} color="#28a745" />
            </>
          )}
        </Suspense>

        {/* Camera controls for desktop */}
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* VR Button */}
      <button
        onClick={enterVR}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          backgroundColor: vrMode ? '#28a745' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'background-color 0.3s ease'
        }}
      >
        {vrMode ? 'VR Mode Active' : 'Enter VR'}
      </button>

      {/* Loading indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontSize: '14px',
        zIndex: 1000,
        opacity: 0.7
      }}>
        {vrMode ? 'VR Mode - Use controllers to navigate' : 'Desktop Mode - Click and drag to look around'}
      </div>
    </div>
  );
};

export default DungeonScene;