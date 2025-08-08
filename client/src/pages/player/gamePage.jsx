import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import DungeonScene from '../../components/scenes/DungeonScene';
import ChatBot from '../../components/ChatBot';


// QR Scanner Component (simplified - removing external dependencies)
const QRScanner = ({ onClose, error, onManualEntry }) => {
  const [manualCode, setManualCode] = useState('');
  
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onManualEntry(manualCode.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-200 rounded-lg h-64 flex items-center justify-center">
        <div className="border-4 border-blue-500 border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
          <p className="text-gray-600 text-center px-4">
            QR Scanner would appear here<br/>
            <span className="text-sm">(Camera access required)</span>
          </p>
        </div>
      </div>
      
      {/* Manual entry as backup */}
      <form onSubmit={handleManualSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Or enter code manually:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="SKIFA_KAHLA_12345"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Enter
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={onClose}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};

// Manual QR Entry Component
const ManualQREntry = ({ onSubmit, error }) => {
  const [qrCode, setQrCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(qrCode);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Enter QR Code Content:
        </label>
        <input
          type="text"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="e.g., SKIFA_KAHLA_12345"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!qrCode.trim()}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ✅ Verify Location
      </button>
    </form>
  );
};

// Main Game Component
const SkifaKahlaARGame = () => {
  // Core game state
  const [gameState, setGameState] = useState('detecting');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [detectionMethod, setDetectionMethod] = useState('');
  
  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrError, setQrError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Puzzle states
  const [puzzleStates, setPuzzleStates] = useState({
    mapFragments: { collected: 0, total: 4 },
    cipherWheel: { solved: false },
    hiddenCompartment: { revealed: false },
    woodenChest: { unlocked: false }
  });

  // Game data
  const gameLocations = {
    skifaKahla: {
      name: 'Skifa Kahla',
      lat: 35.504154,
      lng: 11.035997,
      radius: 50
    }
  };

  // GPS Location Detection
  const getGPSLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        error => reject(error),
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
    });
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const checkLocationMatch = (userLocation) => {
    for (const [key, locationData] of Object.entries(gameLocations)) {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng,
        locationData.lat, 
        locationData.lng
      );
      
      if (distance <= locationData.radius) {
        return key;
      }
    }
    return null;
  };

  const detectLocation = async () => {
    try {
      setGameState('detecting');
      console.log('Attempting GPS location detection...');
      
      const gpsLocation = await getGPSLocation();
      console.log('GPS location:', gpsLocation);
      
      const matchedLocation = checkLocationMatch(gpsLocation);
      
      if (matchedLocation) {
        console.log('Location matched:', matchedLocation);
        setCurrentLocation(matchedLocation);
        setDetectionMethod('gps');
        await loadGameAssets(matchedLocation);
        return matchedLocation;
      } else {
        console.log('No location match found, switching to QR scanning');
        setGameState('qr_scanning');
        return null;
      }
      
    } catch (error) {
      console.error('GPS detection failed:', error);
      setGameState('qr_scanning');
      return null;
    }
  };

  // QR Code Scanner (simplified)
  const startQRScanner = useCallback(async () => {
    try {
      setIsScanning(true);
      setShowQRScanner(true);
      setQrError('');
      // Simplified scanner - in real implementation would use camera
    } catch (error) {
      console.error('QR scanner initialization failed:', error);
      setQrError('Camera access denied or QR scanner failed');
      stopQRScanner();
    } finally {
      setIsScanning(false);
    }
  }, []);

  const stopQRScanner = useCallback(() => {
    setShowQRScanner(false);
    setQrError('');
  }, []);

  const handleQRCodeDetected = useCallback(async (qrContent) => {
    console.log('QR Code detected:', qrContent);
    setGameState('loading');
    stopQRScanner();

    try {
      // Simulate QR validation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentLocation('skifaKahla');
      setDetectionMethod('qr');
      
      await loadGameAssets('skifaKahla');

    } catch (error) {
      console.error('QR code validation failed:', error);
      setQrError(error.message);
      setGameState('qr_scanning');
    }
  }, [stopQRScanner]);

  const handleManualQREntry = useCallback((qrCode) => {
    if (!qrCode.trim()) {
      setQrError('Please enter a QR code');
      return;
    }
    handleQRCodeDetected(qrCode.trim());
  }, [handleQRCodeDetected]);

  // Asset Loading
  const loadGameAssets = async (location) => {
    if (!location) return;

    setGameState('loading');
    setLoadingProgress(0);
    
    // Simulate asset loading with progress
    const simulateLoading = () => {
      return new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setLoadingProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve({});
          }
        }, 200);
      });
    };

    await simulateLoading();
    setGameState('ready');
  };


  // Game Interaction Handlers
  const handleGameInteraction = (modelName) => {
    console.log(`Interacting with: ${modelName}`);
    
    if (modelName.includes('Map Fragment')) {
      setPuzzleStates(prev => {
        const newFragments = { ...prev.mapFragments, collected: prev.mapFragments.collected + 1 };
        const newState = { ...prev, mapFragments: newFragments };
        
        // Reveal hidden compartment when all fragments collected
        if (newFragments.collected >= newFragments.total) {
          newState.hiddenCompartment.revealed = true;
        }
        
        return newState;
      });
    } else if (modelName === 'Cipher Wheel') {
      if (!puzzleStates.cipherWheel.solved) {
        setPuzzleStates(prev => ({
          ...prev,
          cipherWheel: { solved: true }
        }));
      }
    } else if (modelName === 'Hidden Compartment') {
      if (puzzleStates.hiddenCompartment.revealed && puzzleStates.cipherWheel.solved) {
        setPuzzleStates(prev => ({
          ...prev,
          woodenChest: { unlocked: true }
        }));
        console.log('🏆 Ottoman coded message retrieved - Mission accomplished!');
      }
    } else if (modelName === 'Wooden Chest') {
      if (puzzleStates.woodenChest.unlocked) {
        console.log('📜 You have successfully retrieved the Ottoman intelligence!');
      }
    }
  };

  // Initialize game
  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#1a1a1a' }}>
      {/* Show DungeonScene when game is ready or playing */}
    {(gameState === 'ready' || gameState === 'playing') && (
      <DungeonScene />
    )}
      {/* QR Scanner Modal - Only shown when GPS fails */}
      {gameState === 'qr_scanning' && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">🏰 Skifa Kahla Access</h2>
            <p className="text-gray-600 mb-4 text-center">
              GPS detection failed. Please scan the QR code at Skifa Kahla fortress to enter the game.
            </p>
            
            {!showQRScanner ? (
              <div className="space-y-4">
                <button
                  onClick={startQRScanner}
                  disabled={isScanning}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isScanning ? 'Initializing Camera...' : '📱 Scan QR Code'}
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
                <ManualQREntry onSubmit={handleManualQREntry} error={qrError} />
              </div>
            ) : (
              <QRScanner 
                onClose={stopQRScanner} 
                error={qrError}
                onManualEntry={handleManualQREntry}
              />
            )}
          </div>
        </div>
      )}

      {/* Game Status UI */}
      <div className="fixed top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg z-10 max-w-xs border border-amber-600">
        <h2 className="text-xl font-bold mb-2 text-amber-400">🏰 Ottoman Espionage</h2>
        
        {currentLocation && (
          <p className="text-sm mb-2">
            📍 {gameLocations[currentLocation]?.name} 
            <span className="ml-2 text-xs bg-amber-600 px-2 py-1 rounded">
              {detectionMethod === 'gps' ? '🛰️ GPS' : '📱 QR'}
            </span>
          </p>
        )}
        
        {gameState === 'detecting' && (
          <p className="text-sm">🗺️ Detecting your location...</p>
        )}
        
        {gameState === 'loading' && (
          <div>
            <p className="text-sm">📦 Loading fortress assets...</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div 
                className="bg-amber-600 h-2.5 rounded-full transition-all duration-300" 
                style={{width: `${loadingProgress}%`}}
              ></div>
            </div>
            <p className="text-xs mt-1 text-amber-300">{Math.round(loadingProgress)}%</p>
          </div>
        )}
        
        {gameState === 'ready' && (
          <p className="text-sm text-green-400">🏰 Ready to infiltrate the fortress!</p>
        )}
        
        {gameState === 'playing' && (
          <div className="space-y-1 text-sm">
            <p className="text-amber-300">🗺️ Map Fragments: {puzzleStates.mapFragments.collected}/{puzzleStates.mapFragments.total}</p>
            <p className={puzzleStates.cipherWheel.solved ? 'text-green-400' : 'text-gray-400'}>
              🔤 Cipher Wheel: {puzzleStates.cipherWheel.solved ? '✅ Decoded' : '🔄 Locked'}
            </p>
            <p className={puzzleStates.hiddenCompartment.revealed ? 'text-green-400' : 'text-gray-400'}>
              🗝️ Hidden Compartment: {puzzleStates.hiddenCompartment.revealed ? '✅ Revealed' : '❌ Hidden'}
            </p>
            <p className={puzzleStates.woodenChest.unlocked ? 'text-green-400' : 'text-gray-400'}>
              📦 Ottoman Message: {puzzleStates.woodenChest.unlocked ? '✅ Retrieved' : '🔒 Secured'}
            </p>
          </div>
        )}

      </div>
        <ChatBot/>
    </div>
  );
};

export default SkifaKahlaARGame;