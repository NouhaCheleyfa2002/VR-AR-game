import React, { Suspense, useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  { path: "/models/Chest with Gold.glb", position: [-4, 0, -1], scale: 0.8, name: "Chest with Gold", interactive: true },
  { path: "/models/Chest.glb", position: [3, 0, 2], scale: 0.8, name: "Chest", interactive: true },
  { path: "/models/Coin Piles.glb", position: [-5, 0, 0], scale: 0.9, name: "Coin Piles", interactive: true },
  { path: "/models/Crate.glb", position: [4, 0, -3], scale: 0.5, name: "Crate", interactive: true },
  { path: "/models/Skull.glb", position: [-5, 0, 0], scale: 0.9, name: "Skull", interactive: true },
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


  if (!gltf || !gltf.scene) {
    return <FallbackMesh position={position} scale={scale} color={color} />;
  }

  // Use useMemo to prevent unnecessary recreations
  const scene = useMemo(() => {
    const clonedScene = gltf.scene.clone();
    
    // Set userData on the root object for easier detection
    clonedScene.userData = { clickable: !!onClick, name };
    
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Set userData on all mesh children too - IMPORTANT for XR
        child.userData = { clickable: !!onClick, name };
        
        // Also set the name property for easier debugging
        child.name = name;
      }
      // Also check for groups and other object types
      if (child.isGroup) {
        child.userData = { clickable: !!onClick, name };
        child.name = name;
      }
    });
    
    console.log(`🎮 ModelLoader: Set up ${name} with userData for XR compatibility`);
    return clonedScene;
  }, [gltf.scene, name, onClick]);

  return (
    <primitive
      ref={meshRef}
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick ? (e) => {
        console.log(`🖱️ Desktop click on ${name}`);
        e.stopPropagation();
        onClick(name, e);
      } : undefined}
      onPointerOver={onClick ? (e) => {
        document.body.style.cursor = 'pointer';
        if (e.object.material && e.object.material.emissive) {
          e.object.material.emissive = new THREE.Color(0x333333);
        }
      } : undefined}
      onPointerOut={onClick ? (e) => {
        document.body.style.cursor = 'auto';
        if (e.object.material && e.object.material.emissive) {
          e.object.material.emissive = new THREE.Color(0x000000);
        }
      } : undefined}
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

// Create a stable component for interactive models to prevent recreations
const InteractiveModels = React.memo(({ interactions, currentMode, onModelClick }) => {
  console.log('🔄 InteractiveModels rendering with mode:', currentMode);

  // Common wrapper for AR positioning
  const ARWrapper = ({ children, shouldShow }) => {
    if (!shouldShow) return null;
    
    return currentMode === 'ar' ? (
      <group position={[0, -1.6, 0]}>{children}</group>
    ) : (
      <>{children}</>
    );
  };

  return (
    <>
      {/* Arch Door */}
      <ARWrapper shouldShow={interactions.archDoor.visible}>
        <ModelLoader
          path="/models/Arch Door.glb"
          position={[3, 0, 5]}
          scale={0.8}
          name="Arch Door"
          onClick={onModelClick}
        />
      </ARWrapper>

      {/* Trap Door */}
      <ARWrapper shouldShow={interactions.trapDoor.visible}>
        <ModelLoader
          path="/models/Trap Door.glb"
          position={[5, 0, 1]}
          scale={0.5}
          name="Trap Door"
          onClick={onModelClick}
        />
      </ARWrapper>

      {/* Chest */}
      <ARWrapper shouldShow={interactions.chest.state !== 'hidden'}>
        <ModelLoader
          path={
            interactions.chest.state === 'closed' ? 
            "/models/Chest.glb" : 
            "/models/Chest with Gold.glb"
          }
          position={[3, 0, 2]}
          scale={0.5}
          name="Chest"
          onClick={onModelClick}
        />
      </ARWrapper>

      {/* Skull */}
      <ARWrapper shouldShow={interactions.skull.visible && !interactions.skull.moneyVisible}>
        <ModelLoader
          path="/models/Skull.glb"
          position={[-3, 0, 3]}
          scale={0.5}
          name="Skull"
          onClick={onModelClick}
        />
      </ARWrapper>

      {/* Crate */}
      <ARWrapper shouldShow={interactions.crate.visible && !interactions.crate.moneyVisible}>
        <ModelLoader
          path="/models/Crate.glb"
          position={[4, 0, -3]}
          scale={0.5}
          name="Crate"
          onClick={onModelClick}
        />
      </ARWrapper>

      {/* Barrel */}
      <ARWrapper shouldShow={interactions.barrel.visible}>
        <ModelLoader
          path="/models/Barrel.glb"
          position={[-3, 0, -4]}
          scale={0.5}
          name="Barrel"
        />
      </ARWrapper>

      {/* Cobweb */}
      <ARWrapper shouldShow={interactions.cobweb.visible}>
        <ModelLoader
          path="/models/Cobweb.glb"
          position={[3, 0, -2]}
          scale={0.5}
          name="Cobweb"
        />
      </ARWrapper>

      {/* Coin Piles */}
      <ARWrapper shouldShow={!interactions.coinPiles.skullPile.collected && interactions.skull.moneyVisible}>
        <ModelLoader
          path="/models/Coin Piles.glb"
          position={interactions.coinPiles.skullPile.position}
          scale={0.5}
          name="Coin Piles Skull"
          onClick={onModelClick}
        />
      </ARWrapper>

      <ARWrapper shouldShow={!interactions.coinPiles.cratePile.collected && interactions.crate.moneyVisible}>
        <ModelLoader
          path="/models/Coin Piles.glb"
          position={interactions.coinPiles.cratePile.position}
          scale={0.5}
          name="Coin Piles Crate"
          onClick={onModelClick}
        />
      </ARWrapper>

      <ARWrapper shouldShow={!interactions.coinPiles.chestPile.collected && interactions.chest.state === 'open'}>
        <ModelLoader
          path="/models/Coin Piles.glb"
          position={interactions.coinPiles.chestPile.position}
          scale={0.5}
          name="Coin Piles Chest"
          onClick={onModelClick}
        />
      </ARWrapper>

      {/* Torch */}
      <ARWrapper shouldShow={interactions.torch.visible}>
        <ModelLoader
          path="/models/Torch.glb"
          position={[2, 2, 5.3]}
          scale={0.5}
          name="Torch"
        />
      </ARWrapper>
    </>
  );
});

const arUIStyle = {
  position: 'fixed',
  zIndex: 2147483647, // Maximum z-index value
  pointerEvents: 'auto',
  isolation: 'isolate', // Creates new stacking context
  transform: 'translateZ(0)', // Forces hardware acceleration
  willChange: 'transform' // Optimizes for changes
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

// FIXED Mobile Touch Controls - More thorough object detection
const MobileTouchControls = ({ currentMode, onModelClick }) => {
  const { gl, camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const cleanupFunctions = useRef([]);
  const touchStartPos = useRef(null);

  useEffect(() => {
    // Only enable touch controls for mobile (non-desktop) or AR mode
    if (currentMode === 'desktop') {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
      return;
    }

    console.log(`📱 Setting up mobile touch controls for mode: ${currentMode}`);
    const canvas = gl.domElement;

    const handleTouchStart = (event) => {
      event.preventDefault();
      
      if (event.touches.length === 0) return;
      
      const touch = event.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      
      console.log('📱 Touch start recorded at:', touchStartPos.current);
    };

    const handleTouchEnd = (event) => {
      event.preventDefault();
      
      if (!touchStartPos.current) return;
      
      // Use the stored touch start position for click detection
      const rect = canvas.getBoundingClientRect();
      
      // Calculate normalized device coordinates from touch start position
      const x = ((touchStartPos.current.x - rect.left) / rect.width) * 2 - 1;
      const y = -((touchStartPos.current.y - rect.top) / rect.height) * 2 + 1;
      
      console.log('📱 Processing touch end at NDC:', { x, y });
      console.log('📱 Canvas rect:', rect);
      console.log('📱 Touch start pos:', touchStartPos.current);
      
      // Update raycaster
      raycaster.current.setFromCamera({ x, y }, camera);
      
      // Get ALL objects in the scene, including nested ones
      const allObjects = [];
      scene.traverse((object) => {
        if (object.isMesh || object.isGroup || object.userData?.clickable) {
          allObjects.push(object);
        }
      });
      
      console.log('📱 Total traversed objects:', allObjects.length);
      
      // Find intersections with ALL objects
      const intersects = raycaster.current.intersectObjects(allObjects, false);
      
      console.log('📱 Raycast intersections found:', intersects.length);
      
      if (intersects.length > 0) {
        // Process all intersections to find the closest clickable one
        for (let i = 0; i < intersects.length; i++) {
          const intersect = intersects[i];
          let clickableObject = intersect.object;
          
          console.log(`📱 Intersection ${i}:`, {
            type: intersect.object.type,
            name: intersect.object.name,
            userData: intersect.object.userData,
            distance: intersect.distance
          });
          
          // Check the object and its parents for clickable userData
          let depth = 0;
          while (clickableObject && depth < 20) {
            if (clickableObject.userData?.clickable) {
              console.log(`📱 Found clickable object: ${clickableObject.userData.name} at depth ${depth}`);
              
              if (onModelClick) {
                const syntheticEvent = {
                  stopPropagation: () => {},
                  intersection: intersect
                };
                onModelClick(clickableObject.userData.name, syntheticEvent);
              }
              
              touchStartPos.current = null;
              return; // Exit after first successful click
            }
            
            clickableObject = clickableObject.parent;
            depth++;
          }
        }
        
        console.log('📱 No clickable objects found in intersections');
      } else {
        console.log('📱 No intersections found - touch missed all objects');
        
        // Debug: Log camera and scene info
        console.log('📱 Camera position:', camera.position.toArray());
        console.log('📱 Scene children count:', scene.children.length);
        console.log('📱 Raycast origin:', raycaster.current.ray.origin.toArray());
        console.log('📱 Raycast direction:', raycaster.current.ray.direction.toArray());
      }
      
      touchStartPos.current = null;
    };

    // Add event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent default touch behavior
    const preventScroll = (e) => {
      e.preventDefault();
    };
    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    
    cleanupFunctions.current = [
      () => canvas.removeEventListener('touchstart', handleTouchStart),
      () => canvas.removeEventListener('touchend', handleTouchEnd),
      () => canvas.removeEventListener('touchmove', preventScroll)
    ];

    return () => {
      console.log('🧹 Cleaning up mobile touch controls');
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, [currentMode, gl, camera, scene, onModelClick]);

  return null;
};


// Add this new component after MobileTouchControls
const XRInputHandler = ({ currentMode, onModelClick, xrSession }) => {
  const { gl, camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const cleanupFunctions = useRef([]);
  const controllers = useRef([]);

  useEffect(() => {
    if (!xrSession || (currentMode !== 'vr' && currentMode !== 'ar')) {
      // Clean up controllers
      controllers.current.forEach(controller => {
        if (controller.parent) {
          controller.parent.remove(controller);
        }
      });
      controllers.current = [];
      
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
      return;
    }

    console.log(`🎮 Setting up XR input handling for ${currentMode.toUpperCase()}`);

    // Set up controllers for VR/AR
    const setupControllers = () => {
      // Clear existing controllers
      controllers.current.forEach(controller => {
        if (controller.parent) {
          controller.parent.remove(controller);
        }
      });
      controllers.current = [];

      // Create controllers for VR (usually 2) or AR (usually 1)
      const controllerCount = currentMode === 'vr' ? 2 : 1;
      
      for (let i = 0; i < controllerCount; i++) {
        const controller = gl.xr.getController(i);
        
        if (controller) {
          console.log(`🎯 Setting up controller ${i}`);
          
          // Add controller to scene
          scene.add(controller);
          controllers.current.push(controller);
          
          // Add select event listener
          const handleSelect = (event) => {
            console.log(`🎯 XR controller ${i} select event`);
            handleControllerSelect(controller, event);
          };
          
          controller.addEventListener('select', handleSelect);
          
          cleanupFunctions.current.push(() => {
            controller.removeEventListener('select', handleSelect);
            if (controller.parent) {
              controller.parent.remove(controller);
            }
          });
        }
      }

      // For AR, also listen to screen taps as fallback
      if (currentMode === 'ar') {
        const handleScreenSelect = (event) => {
          console.log('🎯 AR screen tap fallback');
          // Use camera for AR screen taps
          handleCameraSelect(event);
        };
        
        xrSession.addEventListener('select', handleScreenSelect);
        cleanupFunctions.current.push(() => {
          xrSession.removeEventListener('select', handleScreenSelect);
        });
      }
    };

    const handleControllerSelect = (controller, event) => {
      if (!controller || !controller.matrixWorld) {
        console.log('❌ Invalid controller or matrix');
        return;
      }

      // Get controller position and direction
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation(controller.matrixWorld);

      const origin = new THREE.Vector3();
      const direction = new THREE.Vector3();

      origin.setFromMatrixPosition(controller.matrixWorld);
      direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      performRaycast(origin, direction);
    };

    const handleCameraSelect = (event) => {
      // For AR screen taps, use camera direction
      const origin = camera.position.clone();
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);

      console.log('🎯 AR Camera raycast from:', origin.toArray(), 'direction:', direction.toArray());
      performRaycast(origin, direction);
    };

    const performRaycast = (origin, direction) => {
      // Set up raycaster
      raycaster.current.set(origin, direction);
      
      console.log('🎯 XR Raycast from:', origin.toArray(), 'direction:', direction.toArray());

      // Get all clickable objects
      const allObjects = [];
      scene.traverse((object) => {
        if (object.isMesh || object.isGroup || object.userData?.clickable) {
          allObjects.push(object);
        }
      });

      console.log('🎯 XR Total objects to check:', allObjects.length);

      // Find intersections - increase recursion for nested objects
      const intersects = raycaster.current.intersectObjects(allObjects, true);
      
      console.log('🎯 XR intersections found:', intersects.length);

      if (intersects.length > 0) {
        for (let i = 0; i < intersects.length; i++) {
          const intersect = intersects[i];
          let clickableObject = intersect.object;
          
          console.log(`🎯 XR Intersection ${i}:`, {
            name: intersect.object.name,
            userData: intersect.object.userData,
            distance: intersect.distance,
            type: intersect.object.type
          });
          
          // Check object and parents for clickable userData
          let depth = 0;
          while (clickableObject && depth < 20) {
            if (clickableObject.userData?.clickable) {
              console.log(`🎯 XR Found clickable: ${clickableObject.userData.name} at depth ${depth}`);
              
              if (onModelClick) {
                const syntheticEvent = {
                  stopPropagation: () => {},
                  intersection: intersect
                };
                onModelClick(clickableObject.userData.name, syntheticEvent);
              }
              return;
            }
            clickableObject = clickableObject.parent;
            depth++;
          }
        }
      }
      
      console.log('🎯 XR No clickable objects found');
    };

    // Wait for XR session to be properly initialized
    const initTimeout = setTimeout(() => {
      setupControllers();
    }, 1000);

    cleanupFunctions.current.push(() => {
      clearTimeout(initTimeout);
    });

    console.log('🎮 XR input handlers setup initiated');

    return () => {
      console.log('🧹 Cleaning up XR input handlers');
      
      // Clean up controllers
      controllers.current.forEach(controller => {
        if (controller.parent) {
          controller.parent.remove(controller);
        }
      });
      controllers.current = [];
      
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, [currentMode, xrSession, scene, camera, onModelClick, gl]);

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
const SceneContent = ({ xrSession, currentMode, isDoorOpen, onModelClick }) => {
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
      
      {/* Use Mobile Touch Controls for both mobile and AR */}
      <MobileTouchControls currentMode={currentMode} onModelClick={onModelClick} />
      <XRInputHandler currentMode={currentMode} onModelClick={onModelClick} xrSession={xrSession} />
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

  // Detect if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       ('ontouchstart' in window) ||
                       (window.innerWidth <= 768);
      
      console.log('📱 Mobile detection:', isMobile);
      console.log('📱 User agent:', navigator.userAgent);
      console.log('📱 Touch support:', 'ontouchstart' in window);
      console.log('📱 Window width:', window.innerWidth);
      
      // Set mobile mode automatically
      if (isMobile && currentMode === 'desktop') {
        console.log('📱 Switching to mobile mode automatically');
        setCurrentMode('mobile');
      }
    };
    
    checkMobile();
  }, [currentMode]);
// Function to show temporary popup
const showPopup = useCallback((message, amount, position) => {
  const id = Date.now();
  setPopups(prev => [...prev, { id, message, amount, position }]);
  
  // Remove after 2 seconds
  setTimeout(() => {
    setPopups(prev => prev.filter(popup => popup.id !== id));
  }, 2000);
}, []);

const handleModelClick = useCallback((modelName, event) => {
  console.log(`🎯 Clicked on: ${modelName}`);
  
  // Prevent multiple clicks
  if (processingClick.current) {
    console.log('🚫 Click already processing, ignoring');
    return;
  }
  processingClick.current = true;
  
  // Reset processing flag after a short delay
  setTimeout(() => {
    processingClick.current = false;
  }, 500);
  
  if (event) {
    event.stopPropagation();
  }
  
  const clickPosition = event?.intersection?.point || new THREE.Vector3();
  
  // Batch state updates to prevent multiple re-renders
  setInteractions(prev => {
    console.log('Previous state money:', prev.moneyCollected);
    
    switch(modelName) {
      case 'Arch Door':
        console.log('🚪 Opening door!');
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
        console.log('🪤 Opening trap door!');
        return {
          ...prev,
          trapDoor: { visible: false },
          chest: { state: 'closed' }
        };
        
      case 'Chest':
        if (prev.chest.state === 'closed') {
          console.log('📦 Opening chest!');
          
          // Use requestAnimationFrame for smooth transition
          requestAnimationFrame(() => {
            setTimeout(() => {
              setInteractions(prevInner => ({
                ...prevInner,
                chest: { state: 'open' },
                moneyCollected: prevInner.moneyCollected + 50
              }));
              setShowWinPopup(true);
              setTimeout(() => setShowWinPopup(false), 3000);
            }, 800); // Reduced from 1000ms
          });
          
          return {
            ...prev,
            chest: { state: 'opening' }
          };
        }
        return prev;
        
      case 'Skull':
        if (!prev.skull.moneyVisible) {
          console.log('💀 Skull reveals money!');
          return {
            ...prev,
            skull: { ...prev.skull, moneyVisible: true }
          };
        }
        return prev;
        
      case 'Crate':
        if (!prev.crate.moneyVisible) {
          console.log('📦 Crate reveals money!');
          return {
            ...prev,
            crate: { ...prev.crate, moneyVisible: true }
          };
        }
        return prev;
        
      case 'Coin Piles Skull':
        if (!prev.coinPiles.skullPile.collected) {
          console.log('💰 Collecting skull coins');
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
        return prev;
        
      case 'Coin Piles Crate':
        if (!prev.coinPiles.cratePile.collected) {
          console.log('💰 Collecting crate coins');
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
        return prev;
        
      case 'Coin Piles Chest':
        if (!prev.coinPiles.chestPile.collected) {
          console.log('💰 Collecting chest coins');
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
        return prev;
        
      default:
        console.log('🤷 Unknown model clicked:', modelName);
        return prev;
    }
  });
}, [showPopup]);

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
        ...arUIStyle,
        top: '20px',
        right: '20px',
        backgroundColor: currentMode === 'ar' ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.7)',
        color: 'gold',
        padding: currentMode === 'ar' ? '20px' : '10px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: currentMode === 'ar' ? '28px' : '18px',
        border: currentMode === 'ar' ? '3px solid gold' : 'none',
        boxShadow: currentMode === 'ar' ? 
          '0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 10px rgba(255, 215, 0, 0.2)' : 
          'none',
        backdropFilter: currentMode === 'ar' ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: currentMode === 'ar' ? 'blur(10px)' : 'none',
        textShadow: currentMode === 'ar' ? '2px 2px 4px black' : 'none'
      }}>
        <strong>💰 Money: ${interactions.moneyCollected}</strong>
      </div>
      {/* Money Popups - AR Compatible */}
      {popups.map(popup => (
      <div
        key={popup.id}
        style={{
          ...arUIStyle,
          ...(currentMode === 'ar' ? {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateZ(0)',
            color: 'gold',
            fontSize: '36px',
            fontWeight: 'bold',
            textShadow: '3px 3px 6px black, 0 0 15px black',
            animation: 'arFloatUp 2s forwards',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: '20px 30px',
            borderRadius: '15px',
            border: '4px solid gold',
            boxShadow: '0 0 30px gold, inset 0 0 15px rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)'
          } : {
            position: 'absolute',
            left: `${50 + (popup.position?.x || 0) * 10}%`,
            top: `${50 - (popup.position?.z || 0) * 10}%`,
            color: 'gold',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '0 0 5px black',
            transform: 'translate(-50%, -50%)',
            animation: 'floatUp 2s forwards'
          })
        }}
      >
        {popup.message}
      </div>
    ))}

      {/* Win Popup - AR Compatible */}
      {showWinPopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: currentMode === 'ar' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.8)',
          color: 'gold',
          padding: currentMode === 'ar' ? '30px' : '20px',
          borderRadius: '10px',
          zIndex: currentMode === 'ar' ? 9999 : 1002, // Higher z-index for AR
          textAlign: 'center',
          border: '2px solid gold',
          boxShadow: currentMode === 'ar' ? '0 0 30px gold' : '0 0 20px gold',
          fontSize: currentMode === 'ar' ? '1.2em' : '1em' 
        }}>
          <h2 style={{ 
            fontSize: currentMode === 'ar' ? '40px' : '32px', 
            margin: '0 0 10px' 
          }}>🎉 Congratulations! 🎉</h2>
          <p style={{ 
            fontSize: currentMode === 'ar' ? '28px' : '24px' 
          }}>You found the treasure!</p>
          <p style={{ 
            fontSize: currentMode === 'ar' ? '24px' : '20px' 
          }}>+$50 added to your collection</p>
        </div>
      )}

      {/* Add CSS animation for popups */}
      <style>
        {`
          @keyframes floatUp {
            0% { opacity: 1; transform: translate(-50%, -50%); }
            100% { opacity: 0; transform: translate(-50%, -150%); }
          }
          @keyframes arFloatUp {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -60%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -70%) scale(0.9); }
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
      <Suspense fallback={<FallbackMesh position={[0, 1, -3]} color="#ff0000" />}>
        <SceneContent 
          xrSession={xrSession} 
          currentMode={currentMode} 
          isDoorOpen={!interactions.archDoor.visible} 
          onModelClick={handleModelClick} 
        />
        
        {/* Always show Arch - stable rendering */}
        {React.useMemo(() => (
          currentMode === 'ar' ? (
            <group position={[0, -1.6, 0]} key="arch-ar">
              <ModelLoader
                path="/models/Arch.glb"
                position={[3, 0, 5]}
                scale={0.8}
                name="Arch"
              />
            </group>
          ) : (
            <ModelLoader
              key="arch-desktop"
              path="/models/Arch.glb"
              position={[3, 0, 5]}
              scale={0.8}
              name="Arch"
            />
          )
        ), [currentMode])}

        {/* Use the stable InteractiveModels component */}
        <InteractiveModels 
          interactions={interactions}
          currentMode={currentMode}
          onModelClick={handleModelClick}
        />
      </Suspense>
    </Canvas>
          

      {/* XR Exit Button - Fixed position when in XR mode */}
      {isXRActive && (
      <button
        onClick={exitXR}
        style={{
          ...arUIStyle,
          top: '20px',
          left: '20px',
          padding: currentMode === 'ar' ? '20px 30px' : '12px 24px',
          backgroundColor: currentMode === 'ar' ? 'rgba(220, 53, 69, 0.95)' : '#dc3545',
          color: 'white',
          border: currentMode === 'ar' ? '3px solid white' : 'none',
          borderRadius: '12px',
          fontSize: currentMode === 'ar' ? '24px' : '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: currentMode === 'ar' ? 
            '0 0 20px rgba(220, 53, 69, 0.8), 0 4px 15px rgba(0,0,0,0.5)' : 
            '0 4px 8px rgba(0,0,0,0.3)',
          backdropFilter: currentMode === 'ar' ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: currentMode === 'ar' ? 'blur(10px)' : 'none',
          textShadow: currentMode === 'ar' ? '2px 2px 4px black' : 'none',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (currentMode === 'ar') {
            e.target.style.transform = 'scale(1.1) translateZ(0)';
            e.target.style.boxShadow = '0 0 30px rgba(220, 53, 69, 1), 0 6px 20px rgba(0,0,0,0.7)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentMode === 'ar') {
            e.target.style.transform = 'scale(1) translateZ(0)';
            e.target.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.8), 0 4px 15px rgba(0,0,0,0.5)';
          }
        }}
      >
        ❌ Exit {currentMode === 'ar' ? 'AR' : 'VR'}
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

      {/* Mobile Touch Debug Feedback */}
      {currentMode !== 'desktop' && (
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
          <div style={{ color: 'gold' }}>Tap on the door to start!</div>
        </div>
      )}
      
      
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