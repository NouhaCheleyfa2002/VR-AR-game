import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { XR, createXRStore } from '@react-three/xr';
import { useGLTF } from '@react-three/drei';

// Simple fallback component
const FallbackMesh = ({ position = [0, 0, 0], scale = 1, color = "red" }) => (
  <mesh position={position} scale={scale}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

const dungeonModels = [
  { path: "/models/Arch Door.glb", position: [0, 0, 0], scale: 0.5, name: "Arch Door", color: "#8B4513" },
  { path: "/models/Arch.glb", position: [2, 0, -3], scale: 0.5, name: "Arch", color: "#A0522D" },
  { path: "/models/Banner Wall.glb", position: [-1, 0, 1], scale: 0.2, name: "Banner Wall", color: "#DC143C" },
  { path: "/models/Banner.glb", position: [1, 0, 2], scale: 0.3, name: "Banner", color: "#FF6347" },
  { path: "/models/Barrel.glb", position: [-2, 0, 1], scale: 0.3, name: "Barrel", color: "#D2691E" },
  { path: "/models/Bricks.glb", position: [-1, 0, -1], scale: 0.3, name: "Bricks", color: "#B22222" },
  { path: "/models/Bucket.glb", position: [0, 0, -2], scale: 0.3, name: "Bucket", color: "#708090" },
  { path: "/models/Chair.glb", position: [3, 0, 0], scale: 0.3, name: "Chair", color: "#8B4513" },
  { path: "/models/Chest with Gold.glb", position: [-3, 0, -1], scale: 0.3, name: "Chest with Gold", color: "#FFD700" },
  { path: "/models/Chest.glb", position: [2, 0, 3], scale: 0.3, name: "Chest", color: "#654321" },
  { path: "/models/Cobweb.glb", position: [-2, 0, -3], scale: 0.3, name: "Cobweb", color: "#D3D3D3" },
  { path: "/models/Coin Bag.glb", position: [4, 0, 1], scale: 0.3, name: "Coin Bag", color: "#FFD700" },
  { path: "/models/Coin Piles.glb", position: [-4, 0, 0], scale: 0.3, name: "Coin Piles", color: "#DAA520" },
  { path: "/models/Column-6y1EFzpRI9.glb", position: [0, 0, 4], scale: 0.3, name: "Column A", color: "#C0C0C0" },
  { path: "/models/Column.glb", position: [-1, 0, 4], scale: 0.3, name: "Column B", color: "#A9A9A9" },
  { path: "/models/Crate.glb", position: [3, 0, -2], scale: 0.3, name: "Crate", color: "#8B4513" },
  { path: "/models/Floor Tile.glb", position: [-3, 0, 2], scale: 0.3, name: "Floor Tile", color: "#808080" },
  { path: "/models/Horse Statue.glb", position: [0, 0, -4], scale: 0.3, name: "Horse Statue", color: "#C2B280" },
  { path: "/models/Pedestal-VE1kTjVgJf.glb", position: [2, 0, -4], scale: 0.3, name: "Pedestal", color: "#696969" },
  { path: "/models/Skull.glb", position: [-2, 0, 4], scale: 0.3, name: "Skull", color: "#F5F5F5" },
  { path: "/models/Small Table.glb", position: [4, 0, -1], scale: 0.3, name: "Small Table", color: "#8B4513" },
  { path: "/models/Sword Wall Mount.glb", position: [-4, 0, -2], scale: 0.3, name: "Sword Wall Mount", color: "#B0C4DE" },
  { path: "/models/Table Big.glb", position: [1, 0, -4], scale: 0.3, name: "Table Big", color: "#A0522D" },
  { path: "/models/Torch.glb", position: [-1, 0, -4], scale: 0.3, name: "Torch", color: "#FF4500" },
  { path: "/models/Trap Door.glb", position: [4, 0, 2], scale: 0.3, name: "Trap Door", color: "#556B2F" },
  { path: "/models/Wall Modular.glb", position: [-4, 0, 1], scale: 0.3, name: "Wall Modular", color: "#708090" },
];

// Scene lighting setup
const SceneLighting = () => (
  <>
    <ambientLight intensity={0.4} />
    <directionalLight 
      position={[10, 10, 5]} 
      intensity={1} 
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-far={50}
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={20}
      shadow-camera-bottom={-20}
    />
    <directionalLight 
      position={[-10, 10, -5]} 
      intensity={0.5} 
      color="#4a90e2"
    />
    <pointLight position={[0, 5, 0]} intensity={0.6} color="#ff6b35" />
    <pointLight position={[5, 2, 5]} intensity={0.3} color="#ffffff" />
    <pointLight position={[-5, 2, -5]} intensity={0.3} color="#ffffff" />
  </>
);

// Ground plane component
const GroundPlane = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
    <planeGeometry args={[100, 100]} />
    <meshStandardMaterial 
      color="#2a2a2a" 
      roughness={0.8}
      metalness={0.1}
    />
  </mesh>
);

// Fixed Model Loader component
const ModelLoader = ({ path, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0], color = "red", name = "Unknown" }) => {
  // This will be handled by Suspense boundary 
  const gltf = useGLTF(path);
  
  useEffect(() => {
    if (gltf?.scene) {
      console.log(`✅ Successfully loaded model: ${name}`);
    }
  }, [gltf, name]);
  
  if (!gltf || !gltf.scene) {
    console.warn(`⚠️ Model ${name} loaded but no scene found`);
    return <FallbackMesh position={position} scale={scale} color={color} />;
  }
  
  // Clone the scene to avoid conflicts when using the same model multiple times
  const clonedScene = gltf.scene.clone();
  
  // Enable shadows on all meshes
  clonedScene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

// Error boundary component for individual models
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`❌ Failed to load model ${this.props.name}:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackMesh 
          position={this.props.position} 
          scale={this.props.scale} 
          color={this.props.color} 
        />
      );
    }

    return this.props.children;
  }
}

// Models renderer with proper error handling
const DungeonModels = () => {
  return (
    <>
      {dungeonModels.map((model, index) => (
        <ModelErrorBoundary 
          key={index} 
          name={model.name} 
          position={model.position} 
          scale={model.scale} 
          color={model.color}
        >
          <Suspense fallback={<FallbackMesh position={model.position} scale={model.scale} color={model.color} />}>
            <ModelLoader
              path={model.path}
              position={model.position} 
              scale={model.scale} 
              color={model.color}
              name={model.name}
            />
          </Suspense>
        </ModelErrorBoundary>
      ))}
    </>
  );
};

// Custom camera controls that work in XR and desktop
const CameraControls = ({ isXR }) => {
  const { camera, gl } = useThree();
  const isPressed = useRef(false);
  const spherical = useRef(new THREE.Spherical());
  const target = useRef(new THREE.Vector3(0, 0, 0)); // Center of orbit
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isXR) return;

    const canvas = gl.domElement;
    camera.lookAt(target.current);
    spherical.current.setFromVector3(camera.position.clone().sub(target.current));

    const handleMouseDown = (event) => {
      isPressed.current = true;
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isPressed.current = false;
    };

    const handleMouseMove = (event) => {
      if (!isPressed.current) return;

      const deltaX = event.clientX - previousMousePosition.current.x;
      const deltaY = event.clientY - previousMousePosition.current.y;

      const ROTATE_SPEED = 0.005;
      spherical.current.theta -= deltaX * ROTATE_SPEED;
      spherical.current.phi -= deltaY * ROTATE_SPEED;

      // Clamp phi so camera doesn't flip
      const EPS = 0.001;
      spherical.current.phi = Math.max(EPS, Math.min(Math.PI - EPS, spherical.current.phi));

      // Update camera position
      const newPos = new THREE.Vector3().setFromSpherical(spherical.current).add(target.current);
      camera.position.copy(newPos);
      camera.lookAt(target.current);

      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const handleWheel = (event) => {
      event.preventDefault();
      spherical.current.radius += event.deltaY * 0.01;
      spherical.current.radius = Math.max(2, Math.min(20, spherical.current.radius));
      const newPos = new THREE.Vector3().setFromSpherical(spherical.current).add(target.current);
      camera.position.copy(newPos);
      camera.lookAt(target.current);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, isXR]);

  return null;
};

// Scene content that works in all modes
const SceneContent = ({ isXR }) => {
  return (
    <>
      <SceneLighting />
      <DungeonModels />
      <GroundPlane />
      <CameraControls isXR={isXR} />
    </>
  );
};

// Create XR store outside component to prevent recreation
const store = createXRStore();

const DungeonScene = () => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [currentMode, setCurrentMode] = useState('desktop');
  const [isXRActive, setIsXRActive] = useState(false);

  // Check XR support
  useEffect(() => {
    const checkXRSupport = async () => {
      if (navigator.xr) {
        try {
          const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
          const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsARSupported(arSupported);
          setIsVRSupported(vrSupported);
          console.log('XR Support - AR:', arSupported, 'VR:', vrSupported);
        } catch (error) {
          console.log('XR support check failed:', error);
          // Enable for emulator
          setIsARSupported(true);
          setIsVRSupported(true);
        }
      } else {
        console.log('WebXR not available, but enabling for emulator');
        // Enable for emulator
        setIsARSupported(true);
        setIsVRSupported(true);
      }
    };
    
    checkXRSupport();
  }, []);

  // Subscribe to store state changes
  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      console.log('XR State changed:', state);
      if (state.session) {
        setIsXRActive(true);
        if (state.session.mode === 'immersive-ar') {
          setCurrentMode('ar');
        } else if (state.session.mode === 'immersive-vr') {
          setCurrentMode('vr');
        }
      } else {
        setIsXRActive(false);
        setCurrentMode('desktop');
      }
    });

    return unsubscribe;
  }, []);

  const enterAR = async () => {
    try {
      console.log('Attempting to enter AR...');
      await store.enterAR();
    } catch (error) {
      console.error('Failed to enter AR:', error);
      alert('Failed to enter AR mode: ' + error.message);
    }
  };

  const enterVR = async () => {
    try {
      console.log('Attempting to enter VR...');
      await store.enterVR();
    } catch (error) {
      console.error('Failed to enter VR:', error);
      alert('Failed to enter VR mode: ' + error.message);
    }
  };

  const exitXR = () => {
    console.log('Exiting XR...');
    store.enterFullscreen(); // This exits XR mode
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#000' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 8], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        style={{ height: '100vh', width: '100vw' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 1);
          console.log('Canvas created successfully');
        }}
      >
        <XR store={store}>
          <Suspense fallback={<FallbackMesh />}>
            <SceneContent isXR={isXRActive} />
          </Suspense>
        </XR>
      </Canvas>

      {/* Control buttons */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 1000
      }}>
        <button
          onClick={currentMode === 'ar' ? exitXR : enterAR}
          style={{
            padding: '12px 24px',
            backgroundColor: currentMode === 'ar' ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease'
          }}
        >
          {currentMode === 'ar' ? 'Exit AR' : 'Enter AR'}
        </button>

        <button
          onClick={currentMode === 'vr' ? exitXR : enterVR}
          style={{
            padding: '12px 24px',
            backgroundColor: currentMode === 'vr' ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease'
          }}
        >
          {currentMode === 'vr' ? 'Exit VR' : 'Enter VR'}
        </button>
      </div>

      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontSize: '14px',
        zIndex: 1000,
        opacity: 0.9,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace'
      }}>
        <div style={{ marginBottom: '5px', fontSize: '16px', fontWeight: 'bold' }}>
          🏰 Dungeon Scene Demo
        </div>
        <div>Mode: <span style={{color: currentMode === 'desktop' ? '#17a2b8' : currentMode === 'ar' ? '#28a745' : '#007bff'}}>{currentMode.toUpperCase()}</span></div>
        <div>XR Active: {isXRActive ? '✅' : '❌'}</div>
        <div>AR Support: {isARSupported ? '✅' : '❌'}</div>
        <div>VR Support: {isVRSupported ? '✅' : '❌'}</div>
        <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
          {currentMode === 'desktop' && 'Mouse: Drag to rotate • Wheel: Zoom'}
          {currentMode === 'ar' && 'AR Mode: Move device to look around'}
          {currentMode === 'vr' && 'VR Mode: Use controllers to interact'}
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8, color: '#17a2b8' }}>
          Models will show as colored cubes (fallbacks)
        </div>
      </div>

      {/* Info panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        color: 'white',
        fontSize: '12px',
        zIndex: 1000,
        opacity: 0.8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: '12px',
        borderRadius: '6px',
        maxWidth: '200px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Dungeon Objects:</div>
        {dungeonModels.map((model, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '3px',
            fontSize: '10px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: model.color,
              marginRight: '6px',
              borderRadius: '2px'
            }}></div>
            {model.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DungeonScene;