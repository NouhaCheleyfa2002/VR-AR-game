import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// Simple fallback component
const FallbackMesh = ({ position = [0, 0, 0], scale = 1, color = "red" }) => (
  <mesh position={position} scale={scale}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

const dungeonModels = [
  // Non-interactive models
  { path: "/models/Arch.glb", position: [3, 0, 5], scale: 0.8, name: "Arch", color: "#A0522D", interactive: false },
  { path: "/models/Barrel.glb", position: [-3, 0, -4], scale: 0.5, name: "Barrel", interactive: false },
  { path: "/models/Cobweb.glb", position: [3, 0, -2], scale: 0.5, name: "Cobweb", interactive: false },
  { path: "/models/Torch.glb", position: [2, 2, 5.3], scale: 0.5, name: "Torch", interactive: false },
  
  // Interactive models (will be handled separately)
  { path: "/models/Arch Door.glb", position: [3, 0, 5], scale: 0.8, name: "Arch Door", interactive: true },
  { path: "/models/Chest with Gold.glb", position: [-4, 0, -1], scale: 0.5, name: "Chest with Gold", interactive: true },
  { path: "/models/Chest.glb", position: [3, 0, 2], scale: 0.5, name: "Chest", interactive: true },
  { path: "/models/Coin Piles.glb", position: [-5, 0, 0], scale: 0.5, name: "Coin Piles", interactive: true },
  { path: "/models/Crate.glb", position: [4, 0, -3], scale: 0.5, name: "Crate", interactive: true },
  { path: "/models/Skull.glb", position: [-5, 0, 0], scale: 0.5, name: "Skull", interactive: true },
  { path: "/models/Trap Door.glb", position: [5, 0, 1], scale: 0.5, name: "Trap Door", interactive: true },
];

// Enhanced lighting optimized for VR
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

// Enhanced ground plane that's more visible
const GroundPlane = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.1, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color="#cccccc"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
    {/* Add a grid helper for better spatial reference */}
    <gridHelper args={[100, 20, '#444444', '#777777']} position={[0, 0, 0]} />
    
  </>
);

// Modify your ModelLoader component to include click handling
const ModelLoader = ({ path, position, scale, rotation = [0, 0, 0], color = "red", name = "Unknown", onClick }) => {
  const gltf = useGLTF(path);
  const meshRef = useRef();

  useFrame(() => {
    // Add any animations here if needed
  });

  if (!gltf || !gltf.scene) {
    return <FallbackMesh position={position} scale={scale} color={color} />;
  }

  // Use useMemo to prevent unnecessary recreations
  const scene = useMemo(() => {
    const clonedScene = gltf.scene.clone();
    
    // Set userData on the root object for easier detection
    clonedScene.userData = { clickable: true, name };
    
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Set userData on all mesh children too
        child.userData = { clickable: true, name };
      }
    });
    
    console.log(`🎮 ModelLoader: Set up ${name} with userData`);
    return clonedScene;
  }, [gltf.scene, name]);

  return (
    <primitive
      ref={meshRef}
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        console.log(`🖱️ Desktop click on ${name}`);
        e.stopPropagation();
        if (onClick) onClick(name, e); // Pass the event to handler
      }}
      // In ModelLoader
      onPointerOver={(e) => {
        if (onClick) {
          document.body.style.cursor = 'pointer';
          if (e.object.material && e.object.material.emissive) {
            e.object.material.emissive = new THREE.Color(0x333333); // subtle highlight
          }
        }
      }}
      onPointerOut={(e) => {
        document.body.style.cursor = 'auto';
        if (e.object.material && e.object.material.emissive) {
          e.object.material.emissive = new THREE.Color(0x000000);
        }
      }}
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

// Models renderer with proper error handling and visible fallbacks
const DungeonModels = ({ isDoorOpen }) => {
  return (
    <>
      {dungeonModels
        .filter(model => !model.interactive) // Only non-interactive models
        .map((model, index) => (
          <ModelErrorBoundary
            key={index}
            name={model.name}
            position={model.position}
            scale={model.scale}
            color={model.color}
          >
            <Suspense fallback={<FallbackMesh position={model.position} scale={model.scale} color={model.color} />}>
              {/* Only show if door is open OR it's the Arch (which should always be visible) */}
              {(isDoorOpen || model.name === 'Arch') && (
                <ModelLoader
                  path={model.path}
                  position={model.position}
                  scale={model.scale}
                  color={model.color}
                  name={model.name}
                />
              )}
            </Suspense>
          </ModelErrorBoundary>
        ))}
    </>
  );
};

// Custom XR Manager that handles both VR and AR
const CustomXRManager = ({ xrSession, currentMode }) => {
  const { gl, camera } = useThree();
  const frameId = useRef();

  useEffect(() => {
    console.log('🔧 Custom XR Manager setup, mode:', currentMode);
    
    if ((currentMode === 'vr' || currentMode === 'ar') && xrSession) {
      console.log(`📡 Setting up custom ${currentMode.toUpperCase()} render loop...`);
      
      // Enable XR on the renderer
      gl.xr.enabled = true;
      
      try {
        // Set the XR session
        gl.xr.setSession(xrSession);
        
        if (currentMode === 'vr') {
          // Position camera for VR
          camera.position.set(3, 1.6, 8);
          camera.lookAt(3, 0, 5);
          camera.updateMatrixWorld();
        } else if (currentMode === 'ar') {
          // For AR, don't set camera position - let XR handle it
          console.log('📱 AR Mode: Letting XR system handle camera positioning');
          // Reset any manual camera controls
          camera.position.set(0, 0, 0);
          camera.rotation.set(0, 0, 0);
          camera.updateMatrixWorld();
        }
        
        console.log(`✅ Custom ${currentMode.toUpperCase()} setup complete`);
        
      } catch (error) {
        console.warn(`⚠️ ${currentMode.toUpperCase()} setup warning:`, error.message);
      }
    } else {
      console.log('🖥️ Disabling XR mode');
      gl.xr.enabled = false;
      
      // Reset camera for desktop if coming back from XR
      if (currentMode === 'desktop') {
        camera.position.set(3, 1.6, 8);
        camera.lookAt(3, 0, 5);
        camera.updateMatrixWorld();
      }
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [gl, camera, xrSession, currentMode]);

  return null;
};

// Desktop controls - ONLY active when in desktop mode
const DesktopCameraControls = ({ currentMode }) => {
  const { camera, gl } = useThree();
  const isPressed = useRef(false);
  const spherical = useRef(new THREE.Spherical());
  const target = useRef(new THREE.Vector3(3, 0, 5));
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cleanupFunctions = useRef([]);
  const isSetup = useRef(false);

  useEffect(() => {
    console.log('DesktopCameraControls effect running with mode:', currentMode);
    
    // IMMEDIATE cleanup if not desktop mode
    if (currentMode !== 'desktop') {
      console.log(`🚫 ${currentMode.toUpperCase()} Mode: Cleaning up desktop controls immediately`);
      
      // Force cleanup any existing event listeners
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      });
      cleanupFunctions.current = [];
      isSetup.current = false;
      
      // Also remove any event listeners that might be lingering
      const canvas = gl.domElement;
      const removeAllListeners = () => {
        ['mousedown', 'mouseup', 'mousemove', 'wheel', 'touchstart', 'touchmove', 'touchend'].forEach(eventType => {
          canvas.removeEventListener(eventType, () => {}, { passive: false });
        });
      };
      removeAllListeners();
      
      return;
    }

    // Only proceed if definitely in desktop mode
    if (currentMode === 'desktop') {
      // Don't setup twice
      if (isSetup.current) {
        console.log('🖱️ Desktop controls already setup, skipping');
        return;
      }

      console.log('🖱️ Desktop Mode: Setting up mouse controls');
      const canvas = gl.domElement;
      
      // Set camera position for desktop
      camera.position.set(3, 1.6, 8);
      camera.lookAt(target.current);
      camera.updateMatrixWorld();
      
      spherical.current.setFromVector3(camera.position.clone().sub(target.current));

      const handleMouseDown = (event) => {
        if (currentMode !== 'desktop') return; // Safety check
        console.log('Mouse down in desktop mode');
        isPressed.current = true;
        previousMousePosition.current = { x: event.clientX, y: event.clientY };
      };

      const handleMouseUp = () => {
        if (currentMode !== 'desktop') return; // Safety check
        console.log('Mouse up in desktop mode');
        isPressed.current = false;
      };

      const handleMouseMove = (event) => {
        if (currentMode !== 'desktop' || !isPressed.current) return; // Safety check

        const deltaX = event.clientX - previousMousePosition.current.x;
        const deltaY = event.clientY - previousMousePosition.current.y;

        const ROTATE_SPEED = 0.005;
        spherical.current.theta -= deltaX * ROTATE_SPEED;
        spherical.current.phi -= deltaY * ROTATE_SPEED;

        const EPS = 0.001;
        spherical.current.phi = Math.max(EPS, Math.min(Math.PI - EPS, spherical.current.phi));

        const newPos = new THREE.Vector3().setFromSpherical(spherical.current).add(target.current);
        camera.position.copy(newPos);
        camera.lookAt(target.current);

        previousMousePosition.current = { x: event.clientX, y: event.clientY };
      };

      const handleWheel = (event) => {
        if (currentMode !== 'desktop') return; // Safety check
        event.preventDefault();
        spherical.current.radius += event.deltaY * 0.01;
        spherical.current.radius = Math.max(2, Math.min(50, spherical.current.radius));
        const newPos = new THREE.Vector3().setFromSpherical(spherical.current).add(target.current);
        camera.position.copy(newPos);
        camera.lookAt(target.current);
      };

      // Prevent touch events from interfering
      const preventTouch = (event) => {
        if (currentMode !== 'desktop') return;
        event.preventDefault();
      };

      canvas.addEventListener('mousedown', handleMouseDown, { passive: false });
      canvas.addEventListener('mouseup', handleMouseUp, { passive: false });
      canvas.addEventListener('mousemove', handleMouseMove, { passive: false });
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      
      // Block touch events when in desktop mode
      canvas.addEventListener('touchstart', preventTouch, { passive: false });
      canvas.addEventListener('touchmove', preventTouch, { passive: false });
      canvas.addEventListener('touchend', preventTouch, { passive: false });

      // Store cleanup functions
      cleanupFunctions.current = [
        () => canvas.removeEventListener('mousedown', handleMouseDown),
        () => canvas.removeEventListener('mouseup', handleMouseUp),
        () => canvas.removeEventListener('mousemove', handleMouseMove),
        () => canvas.removeEventListener('wheel', handleWheel),
        () => canvas.removeEventListener('touchstart', preventTouch),
        () => canvas.removeEventListener('touchmove', preventTouch),
        () => canvas.removeEventListener('touchend', preventTouch)
      ];

      isSetup.current = true;
      console.log('🖱️ Desktop controls setup complete');
    }

    return () => {
      console.log(`🧹 Cleaning up desktop controls (mode: ${currentMode})`);
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      });
      cleanupFunctions.current = [];
      isSetup.current = false;
    };
  }, [camera, gl, currentMode]);

  return null;
};

// AR Touch Controls - handles touch interactions in AR mode
const ARTouchControls = ({ currentMode, onModelClick }) => {
  const { gl, camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const cleanupFunctions = useRef([]);

  useEffect(() => {
    if (currentMode !== 'ar') {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
      return;
    }

    console.log('📱 Setting up AR touch controls');
    const canvas = gl.domElement;

    const handleTouch = (event) => {
      event.preventDefault();
      if (event.touches.length === 0) return;

      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      
      // Calculate normalized device coordinates
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update raycaster
      raycaster.current.setFromCamera({ x, y }, camera);
      
      // Find intersections - look deep into the scene hierarchy
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        const intersect = intersects[0];
        let clickableObject = intersect.object;
        
        // Traverse up the parent chain to find the object with userData
        while (clickableObject && !clickableObject.userData?.clickable) {
          clickableObject = clickableObject.parent;
        }
        
        if (clickableObject?.userData?.clickable) {
          console.log('📱 AR Touch hit:', clickableObject.userData.name);
          if (onModelClick) {
            const syntheticEvent = {
              stopPropagation: () => {},
              intersection: intersect
            };
            onModelClick(clickableObject.userData.name, syntheticEvent);
          }
        }
      }
    };

    // Add both touchstart and touchend for better responsiveness
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchend', handleTouch, { passive: false });
    
    cleanupFunctions.current = [
      () => canvas.removeEventListener('touchstart', handleTouch),
      () => canvas.removeEventListener('touchend', handleTouch)
    ];

    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, [currentMode, gl, camera, scene, onModelClick]);

  return null;
};
const ARCameraHandler = ({ currentMode }) => {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (currentMode === 'ar') {
      console.log('📱 AR Camera Handler: Setting up AR camera');
      
      // Reset camera to origin for AR
      camera.position.set(0, 0, 0);
      camera.rotation.set(0, 0, 0);
      camera.scale.set(1, 1, 1);
      camera.updateMatrixWorld();
      
      // Let WebXR handle the camera entirely
      console.log('📱 AR Camera positioned at origin, WebXR will handle movement');
    }
  }, [currentMode, camera]);

  return null;
};

// Scene content without @react-three/xr dependencies
const SceneContent = ({ xrSession, currentMode, isDoorOpen }) => {
  return (
    <>
      <CustomXRManager xrSession={xrSession} currentMode={currentMode} />
      
      {currentMode === 'ar' && (
        <>
          <ARCameraHandler currentMode={currentMode} />
          {/* Add lighting for AR mode */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[0, 2, 0]} intensity={0.8} color="#ffffff" />
          
          <group position={[0, -1.6, 0]}>
            <DungeonModels isDoorOpen={isDoorOpen} />
          </group>
        </>
      )}
      
      {currentMode !== 'ar' && (
        <>
          <SceneLighting />
          <DungeonModels isDoorOpen={isDoorOpen} />
          <GroundPlane />
        </>
      )}
      
      {currentMode === 'desktop' && <DesktopCameraControls currentMode={currentMode} />}
    </>
  );
};

const DungeonScene = () => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [currentMode, setCurrentMode] = useState('desktop');
  const [supportCheckComplete, setSupportCheckComplete] = useState(false);
  const [lastError, setLastError] = useState('');
  const [xrSession, setXrSession] = useState(null);
  const [popups, setPopups] = useState([]);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const processingClick = useRef(false);

  // Add this state to track interactive objects
  const [interactions, setInteractions] = useState({
    archDoor: { visible: true },
    trapDoor: { visible: false },
    chest: { state: 'hidden' }, // 'hidden', 'closed', 'opening', 'open'
    skull: { visible: false, moneyVisible: false },
    crate: { visible: false, moneyVisible: false },
    barrel: { visible: false },
    cobweb: { visible: false },
    coinPiles: {
      skullPile: { collected: false, position: [-3, 0, 3] },
      cratePile: { collected: false, position: [4, 0, -3] },
      chestPile: { collected: false, position: [3, 0, 2] }
    },
    torch: { visible: false },
    // Track collected money
    moneyCollected: 0
  });

  // Helper function to check if we're in XR mode
  const isXRActive = currentMode === 'vr' || currentMode === 'ar';

// Function to show temporary popup
const showPopup = (message, amount, position) => {
  const id = Date.now(); // Unique ID for each popup
  setPopups(prev => [...prev, { id, message, amount, position }]);
  
  // Remove after 2 seconds
  setTimeout(() => {
    setPopups(prev => prev.filter(popup => popup.id !== id));
  }, 2000);
};

const handleModelClick = (modelName, event) => {
  console.log(`Clicked on: ${modelName}`);
  
  // Prevent event bubbling
  if (event) {
    event.stopPropagation();
  }
  
  // Use functional update to ensure we always get the latest state
  setInteractions(prev => {
    console.log('Previous state money:', prev.moneyCollected);
    
    const clickPosition = event?.intersection?.point || new THREE.Vector3();
    
    switch(modelName) {
      case 'Arch Door':
        return {
          ...prev,
          archDoor: { visible: false },
          barrel: { visible: true },
          cobweb: { visible: true },
          torch: { visible: true },
          trapDoor: { visible: true },
          skull: { visible: true },
          crate: { visible: true }
        };
        
      case 'Trap Door':
        return {
          ...prev,
          trapDoor: { visible: false },
          chest: { state: 'closed' }
        };
        
      case 'Chest':
        if (prev.chest.state === 'closed') {
          // Handle chest opening with separate state update
          setTimeout(() => {
            setInteractions(prevInner => ({
              ...prevInner,
              chest: { state: 'open' },
              moneyCollected: prevInner.moneyCollected + 50
            }));
            setShowWinPopup(true);
            setTimeout(() => setShowWinPopup(false), 3000);
          }, 1000);
          
          return {
            ...prev,
            chest: { state: 'opening' }
          };
        }
        return prev;
        
      case 'Skull':
        if (!prev.skull.moneyVisible) {
          return {
            ...prev,
            skull: { ...prev.skull, moneyVisible: true }
          };
        }
        return prev;
        
      case 'Crate':
        if (!prev.crate.moneyVisible) {
          return {
            ...prev,
            crate: { ...prev.crate, moneyVisible: true }
          };
        }
        return prev;
        
      case 'Coin Piles Skull':
        console.log('Checking skull pile collection:', prev.coinPiles.skullPile.collected);
        if (!prev.coinPiles.skullPile.collected) {
          console.log('Collecting skull coins, adding 10 to:', prev.moneyCollected);
          showPopup("+$10", 10, clickPosition);
          return {
            ...prev,
            coinPiles: {
              ...prev.coinPiles,
              skullPile: { ...prev.coinPiles.skullPile, collected: true }
            },
            moneyCollected: prev.moneyCollected + 10
          };
        }
        console.log('Skull coins already collected');
        return prev;
        
      case 'Coin Piles Crate':
        console.log('Checking crate pile collection:', prev.coinPiles.cratePile.collected);
        if (!prev.coinPiles.cratePile.collected) {
          console.log('Collecting crate coins, adding 20 to:', prev.moneyCollected);
          showPopup("+$20", 20, clickPosition);
          return {
            ...prev,
            coinPiles: {
              ...prev.coinPiles,
              cratePile: { ...prev.coinPiles.cratePile, collected: true }
            },
            moneyCollected: prev.moneyCollected + 20
          };
        }
        console.log('Crate coins already collected');
        return prev;
        
      case 'Coin Piles Chest':
        console.log('Checking chest pile collection:', prev.coinPiles.chestPile.collected);
        if (!prev.coinPiles.chestPile.collected) {
          console.log('Collecting chest coins, adding 50 to:', prev.moneyCollected);
          showPopup("+$50", 50, clickPosition);
          return {
            ...prev,
            coinPiles: {
              ...prev.coinPiles,
              chestPile: { ...prev.coinPiles.chestPile, collected: true }
            },
            moneyCollected: prev.moneyCollected + 50
          };
        }
        console.log('Chest coins already collected');
        return prev;
        
      default:
        return prev;
    }
  });
};

  useEffect(() => {
    const checkXRSupport = async () => {
      console.log('🔍 Checking XR support...');
      
      if (!('xr' in navigator)) {
        console.log('❌ WebXR not available in this browser');
        setSupportCheckComplete(true);
        return;
      }

      try {
        const [vrSupported, arSupported] = await Promise.allSettled([
          navigator.xr.isSessionSupported('immersive-vr'),
          navigator.xr.isSessionSupported('immersive-ar')
        ]);

        const vrResult = vrSupported.status === 'fulfilled' && vrSupported.value;
        const arResult = arSupported.status === 'fulfilled' && arSupported.value;

        setIsVRSupported(vrResult);
        setIsARSupported(arResult);
        
        console.log('VR Support:', vrResult ? '✅' : '❌');
        console.log('AR Support:', arResult ? '✅' : '❌');

      } catch (error) {
        console.error('XR support check error:', error);
        setIsVRSupported(false);
        setIsARSupported(false);
      } finally {
        setSupportCheckComplete(true);
      }
    };
    
    checkXRSupport();
  }, []);

  const enterVR = async () => {
    try {
      console.log('🥽 Attempting to enter VR...');
      setLastError('');
      
      if (!navigator.xr) {
        throw new Error('WebXR not supported');
      }

      console.log('Requesting VR session...');
      
      // Minimal session request to avoid emulator issues
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor']
      });
      
      console.log('✅ VR session created successfully:', session);
      
      // Add session event listeners
      session.addEventListener('end', () => {
        console.log('VR session ended');
        setCurrentMode('desktop');
        setXrSession(null);
      });
      
      // Set the session and activate VR
      setXrSession(session);
      setCurrentMode('vr');
      
      console.log('🎮 VR session should now be active');
      
      // Give the system a moment to initialize
      setTimeout(() => {
        console.log('🔄 VR initialization complete - you should now see the scene');
      }, 1000);
        
    } catch (error) {
      console.error('❌ Failed to enter VR:', error);
      setLastError(`VR failed: ${error.message}`);
    }
  };

  const enterAR = async () => {
    try {
      console.log('📱 Attempting to enter AR...');
      console.log('Current navigator.xr:', navigator.xr);
      console.log('AR Support detected:', isARSupported);
      setLastError('');
      
      if (!navigator.xr) {
        throw new Error('WebXR not supported in this browser');
      }
      
      // Try with minimal features first
      console.log('🔄 Requesting AR session with minimal features...');
      
      let session;
      try {
        // Try with just local-floor
        session = await navigator.xr.requestSession('immersive-ar', {
          optionalFeatures: ['local-floor']
        });
        console.log('✅ AR session with local-floor created');
      } catch (e1) {
        console.log('⚠️ local-floor failed, trying without features:', e1.message);
        try {
          // Try with no features at all
          session = await navigator.xr.requestSession('immersive-ar', {});
          console.log('✅ AR session with no features created');
        } catch (e2) {
          console.log('❌ Both attempts failed');
          throw e2;
        }
      }
  
      console.log('✅ AR session created successfully:', session);
      setXrSession(session);
      setCurrentMode('ar');
      
      console.log('📱 AR mode should now be active');
  
      session.addEventListener('end', () => {
        console.log('AR session ended');
        setCurrentMode('desktop');
        setXrSession(null);
      });
  
    } catch (error) {
      console.error('❌ Failed to enter AR:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setLastError(`AR failed: ${error.message}`);
    }
  };

  const exitXR = () => {
    console.log('🚪 Exiting XR...');
    setLastError('');
    try {
      if (xrSession) {
        console.log('Ending XR session...');
        xrSession.end();
      }
      setXrSession(null);
      setCurrentMode('desktop');
    } catch (error) {
      console.error('Exit XR error:', error);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#222' }}>
      {/* Money Collection UI */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'gold',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px'
      }}>
        Money Collected: ${interactions.moneyCollected}
      </div>
      {/* Money Popups */}
      {popups.map(popup => (
        <div
          key={popup.id}
          style={{
            position: 'absolute',
            left: `${50 + (popup.position?.x || 0) * 10}%`,
            top: `${50 - (popup.position?.z || 0) * 10}%`,
            color: 'gold',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '0 0 5px black',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
            animation: 'floatUp 2s forwards'
          }}
        >
          {popup.message}
        </div>
      ))}

      {/* Win Popup */}
      {showWinPopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'gold',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 1002,
          textAlign: 'center',
          border: '2px solid gold',
          boxShadow: '0 0 20px gold'
        }}>
          <h2 style={{ fontSize: '32px', margin: '0 0 10px' }}>🎉 Congratulations! 🎉</h2>
          <p style={{ fontSize: '24px' }}>You found the treasure!</p>
          <p style={{ fontSize: '20px' }}>+$50 added to your collection</p>
        </div>
      )}

      {/* Add CSS animation for popups */}
      <style>
        {`
          @keyframes floatUp {
            0% { opacity: 1; transform: translate(-50%, -50%); }
            100% { opacity: 0; transform: translate(-50%, -150%); }
          }
        `}
      </style>
      <Canvas
      shadows
      camera={{
        position: [3, 1.6, 8],
        fov: 75,
        near: 0.1,
        far: 1000
      }}
      gl={{
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance"
      }}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}
      onCreated={({ gl, scene, camera }) => {
        gl.setClearColor('#333333', 1);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        
        console.log('🎨 Canvas created successfully');
        console.log('Initial camera position:', camera.position.toArray());
        console.log('Scene children count:', scene.children.length);
      }}
      onClick={(e) => {
        // This handles clicks that don't hit any object
        console.log("Clicked on empty space");
      }}
    >
      <Suspense fallback={
        <group>
          <FallbackMesh position={[0, 1, -3]} color="#ff0000" />
          <FallbackMesh position={[2, 1, -3]} color="#00ff00" />
          <FallbackMesh position={[-2, 1, -3]} color="#0000ff" />
        </group>
      }>
        <SceneContent xrSession={xrSession} currentMode={currentMode} isDoorOpen={!interactions.archDoor.visible} />
        
        {/* Add AR touch controls */}
        <ARTouchControls currentMode={currentMode} onModelClick={handleModelClick} />
        
        {/* Always show Arch */}
        {(currentMode === 'ar') ? (
          <group position={[0, -1.6, 0]}>
            <ModelLoader
              path="/models/Arch.glb"
              position={[3, 0, 5]}
              scale={0.8}
              name="Arch"
            />
          </group>
        ) : (
          <ModelLoader
            path="/models/Arch.glb"
            position={[3, 0, 5]}
            scale={0.8}
            name="Arch"
          />
        )}

        {/* Interactive models with conditional rendering */}
        {interactions.archDoor.visible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Arch Door.glb"
                position={[3, 0, 5]}
                scale={0.8}
                name="Arch Door"
                onClick={handleModelClick}
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Arch Door.glb"
              position={[3, 0, 5]}
              scale={0.8}
              name="Arch Door"
              onClick={handleModelClick}
            />
          )
        )}

        {interactions.trapDoor.visible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Trap Door.glb"
                position={[5, 0, 1]}
                scale={0.5}
                name="Trap Door"
                onClick={handleModelClick}
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Trap Door.glb"
              position={[5, 0, 1]}
              scale={0.5}
              name="Trap Door"
              onClick={handleModelClick}
            />
          )
        )}

        {interactions.chest.state !== 'hidden' && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path={
                  interactions.chest.state === 'closed' ? 
                  "/models/Chest.glb" : 
                  "/models/Chest with Gold.glb"
                }
                position={[3, 0, 2]}
                scale={0.5}
                name="Chest"
                onClick={handleModelClick}
              />
            </group>
          ) : (
            <ModelLoader
              path={
                interactions.chest.state === 'closed' ? 
                "/models/Chest.glb" : 
                "/models/Chest with Gold.glb"
              }
              position={[3, 0, 2]}
              scale={0.5}
              name="Chest"
              onClick={handleModelClick}
            />
          )
        )}

        {/* Skull - only show the skull, not coin piles here */}
        {interactions.skull.visible && !interactions.skull.moneyVisible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Skull.glb"
                position={[-3, 0, 3]}
                scale={0.5}
                name="Skull"
                onClick={handleModelClick}
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Skull.glb"
              position={[-3, 0, 3]}
              scale={0.5}
              name="Skull"
              onClick={handleModelClick}
            />
          )
        )}

        {/* Crate - only show the crate, not coin piles here */}
        {interactions.crate.visible && !interactions.crate.moneyVisible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Crate.glb"
                position={[4, 0, -3]}
                scale={0.5}
                name="Crate"
                onClick={handleModelClick}
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Crate.glb"
              position={[4, 0, -3]}
              scale={0.5}
              name="Crate"
              onClick={handleModelClick}
            />
          )
        )}

        {/* Other items that appear after door is opened */}
        {interactions.barrel.visible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Barrel.glb"
                position={[-3, 0, -4]}
                scale={0.5}
                name="Barrel"
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Barrel.glb"
              position={[-3, 0, -4]}
              scale={0.5}
              name="Barrel"
            />
          )
        )}

        {interactions.cobweb.visible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Cobweb.glb"
                position={[3, 0, -2]}
                scale={0.5}
                name="Cobweb"
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Cobweb.glb"
              position={[3, 0, -2]}
              scale={0.5}
              name="Cobweb"
            />
          )
        )}

        {/* Coin piles with unique names - only render these */}
        {!interactions.coinPiles.skullPile.collected && interactions.skull.moneyVisible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Coin Piles.glb"
                position={interactions.coinPiles.skullPile.position}
                scale={0.5}
                name="Coin Piles Skull"
                onClick={handleModelClick}
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Coin Piles.glb"
              position={interactions.coinPiles.skullPile.position}
              scale={0.5}
              name="Coin Piles Skull"
              onClick={handleModelClick}
            />
          )
        )}

        {!interactions.coinPiles.cratePile.collected && interactions.crate.moneyVisible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Coin Piles.glb"
                position={interactions.coinPiles.cratePile.position}
                scale={0.5}
                name="Coin Piles Crate"
                onClick={handleModelClick}
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Coin Piles.glb"
              position={interactions.coinPiles.cratePile.position}
              scale={0.5}
              name="Coin Piles Crate"
              onClick={handleModelClick}
            />
          )
        )}

        {!interactions.coinPiles.chestPile.collected && interactions.chest.state === 'open' && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Coin Piles.glb"
                position={interactions.coinPiles.chestPile.position}
                scale={0.5}
                name="Coin Piles Chest"
                onClick={handleModelClick}
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Coin Piles.glb"
              position={interactions.coinPiles.chestPile.position}
              scale={0.5}
              name="Coin Piles Chest"
              onClick={handleModelClick}
            />
          )
        )}

        {interactions.torch.visible && (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]}>
              <ModelLoader
                path="/models/Torch.glb"
                position={[2, 2, 5.3]}
                scale={0.5}
                name="Torch"
              />
            </group>
          ) : (
            <ModelLoader
              path="/models/Torch.glb"
              position={[2, 2, 5.3]}
              scale={0.5}
              name="Torch"
            />
          )
        )}
        
      </Suspense>
    </Canvas>
          

      {/* XR Exit Button - Fixed position when in XR mode */}
      {isXRActive && (
        <button
          onClick={exitXR}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '12px 24px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 1200,
            transition: 'transform 0.2s ease'
          }}
        >
          Exit {currentMode === 'ar' ? 'AR' : 'VR'}
        </button>
      )}

      {/* Error Display */}
      {lastError && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(220, 53, 69, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 1300,
          maxWidth: '80%',
          textAlign: 'center'
        }}>
          <h3>Error</h3>
          <p>{lastError}</p>
          <button 
            onClick={() => setLastError('')}
            style={{
              backgroundColor: 'white',
              color: '#dc3545',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Touch Debug Feedback - only in AR mode */}
      {currentMode === 'ar' && (
        <div style={{
          position: 'fixed',
          top: '100px',
          left: '10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          <div>Touch anywhere on screen to interact</div>
          <div>Look at the console for touch debug info</div>
          <div style={{ color: 'gold' }}>Tap on the door to start!</div>
        </div>
      )}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <div>Mode: {currentMode}</div>
        <div>XR Session: {xrSession ? 'Active' : 'None'}</div>
        <div>AR Support: {supportCheckComplete ? (isARSupported ? '✅' : '❌') : '🔄'}</div>
        <div>VR Support: {supportCheckComplete ? (isVRSupported ? '✅' : '❌') : '🔄'}</div>
        <div>WebXR: {navigator.xr ? '✅' : '❌'}</div>
      </div>
      {!isXRActive && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 1000
        }}>
          <button
            onClick={currentMode === 'ar' ? exitXR : enterAR}
            disabled={!supportCheckComplete || !isARSupported}
            style={{
              padding: '12px 24px',
              backgroundColor: currentMode === 'ar' ? '#dc3545' :
                            (supportCheckComplete && isARSupported) ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (supportCheckComplete && isARSupported) ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease',
              opacity: (supportCheckComplete && isARSupported) ? 1 : 0.6
            }}
          >
            {!supportCheckComplete ? 'Checking AR...' : 
            !isARSupported ? 'AR Not Supported' :
            currentMode === 'ar' ? 'Exit AR' : 'Start AR'}
          </button>

          <button
            onClick={currentMode === 'vr' ? exitXR : enterVR}
            disabled={!supportCheckComplete || !isVRSupported}
            style={{
              padding: '12px 24px',
              backgroundColor: currentMode === 'vr' ? '#dc3545' :
                             (supportCheckComplete && isVRSupported) ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (supportCheckComplete && isVRSupported) ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease',
              opacity: (supportCheckComplete && isVRSupported) ? 1 : 0.6
            }}
          >
            {currentMode === 'vr' ? 'Exit VR' : 'Try VR'}
          </button>
        </div>
      )}

    </div>
  );
};

export default DungeonScene;