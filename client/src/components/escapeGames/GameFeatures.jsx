import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { BrowserQRCodeReader } from '@zxing/library';

// Audio Echo Detection Component
const AudioEchoDetector = ({ onHollowWallDetected, isActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [echoStrength, setEchoStrength] = useState(0);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [microphone, setMicrophone] = useState(null);
  const animationRef = useRef();

  useEffect(() => {
    if (isActive) {
      initializeAudio();
    }
    return () => {
      stopListening();
    };
  }, [isActive]);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      
      analyserNode.fftSize = 2048;
      source.connect(analyserNode);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      setMicrophone(stream);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const startListening = () => {
    if (!analyser) return;
    
    setIsListening(true);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const detectEcho = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average frequency strength
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      
      // Detect echo patterns (simplified algorithm)
      const lowFreq = dataArray.slice(0, bufferLength / 4).reduce((sum, val) => sum + val, 0) / (bufferLength / 4);
      const midFreq = dataArray.slice(bufferLength / 4, bufferLength / 2).reduce((sum, val) => sum + val, 0) / (bufferLength / 4);
      
      // Echo detection logic: hollow walls have distinct reverb patterns
      const echoRatio = lowFreq / (midFreq + 1);
      const strength = Math.min(100, (echoRatio * average) / 10);
      
      setEchoStrength(strength);
      
      // Trigger hollow wall detection if echo strength is above threshold
      if (strength > 75) {
        onHollowWallDetected(strength);
        setIsListening(false);
        return;
      }
      
      if (isListening) {
        animationRef.current = requestAnimationFrame(detectEcho);
      }
    };
    
    detectEcho();
  };

  const stopListening = () => {
    setIsListening(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (microphone) {
      microphone.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
  };

  return (
    <div className="bg-stone-800 p-4 rounded-lg text-amber-100">
      <h3 className="font-bold mb-3">🏛️ Echo Detection</h3>
      <p className="text-sm mb-3">Walk near walls and tap them to detect hollow spaces</p>
      
      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!analyser}
          className={`px-4 py-2 rounded ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-amber-600 hover:bg-amber-700'
          } disabled:bg-gray-500`}
        >
          {isListening ? '🔴 Stop' : '🎤 Listen'}
        </button>
        
        <div className="flex-1">
          <div className="w-full bg-stone-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-200 ${
                echoStrength > 75 ? 'bg-green-500' : 
                echoStrength > 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{width: `${echoStrength}%`}}
            />
          </div>
          <p className="text-xs mt-1">Echo Strength: {Math.round(echoStrength)}%</p>
        </div>
      </div>
      
      {echoStrength > 75 && (
        <div className="bg-green-900 p-2 rounded text-green-100 animate-pulse">
          ✅ Hollow wall detected! There might be something hidden here...
        </div>
      )}
    </div>
  );
};

// Cipher Wheel Component
const CipherWheel = ({ onSolved, isActive }) => {
  const [currentRotation, setCurrentRotation] = useState(0);
  const [innerRing, setInnerRing] = useState(0);
  const [outerRing, setOuterRing] = useState(0);
  const [decodedMessage, setDecodedMessage] = useState('');
  const [isSolved, setIsSolved] = useState(false);

  // Ottoman-era Arabic numerals and corresponding letters
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const secretCode = ['٦', '٧', '٨', '٩']; // The hidden message indices
  const correctSolution = 'CHEF'; // Expected decoded message

  const rotateCipherWheel = (direction, ring) => {
    const step = 36; // 10 positions, 360/10 = 36 degrees
    
    if (ring === 'inner') {
      const newRotation = innerRing + (direction * step);
      setInnerRing(newRotation % 360);
    } else {
      const newRotation = outerRing + (direction * step);
      setOuterRing(newRotation % 360);
    }
    
    updateDecodedMessage();
  };

  const updateDecodedMessage = () => {
    const innerPos = Math.floor((innerRing % 360) / 36);
    const outerPos = Math.floor((outerRing % 360) / 36);
    
    // Decode the secret message based on wheel positions
    let decoded = '';
    secretCode.forEach(code => {
      const adjustedIndex = (code + innerPos + outerPos) % 10;
      decoded += letters[adjustedIndex];
    });
    
    setDecodedMessage(decoded);
    
    // Check if solved
    if (decoded === correctSolution) {
      setIsSolved(true);
      onSolved();
    }
  };

  useEffect(() => {
    updateDecodedMessage();
  }, [innerRing, outerRing]);

  return (
    <div className="bg-amber-900 p-4 rounded-lg text-amber-100">
      <h3 className="font-bold mb-3">🔤 Ottoman Cipher Wheel</h3>
      <p className="text-sm mb-3">Align the Arabic numerals to decode the message</p>
      
      {/* Visual Cipher Wheel */}
      <div className="relative w-48 h-48 mx-auto mb-4">
        {/* Outer Ring */}
        <div 
          className="absolute inset-0 border-4 border-amber-600 rounded-full bg-amber-800"
          style={{ transform: `rotate(${outerRing}deg)` }}
        >
          {arabicNumerals.map((numeral, index) => (
            <div
              key={`outer-${index}`}
              className="absolute w-6 h-6 text-center font-bold text-lg"
              style={{
                top: '10px',
                left: '50%',
                transform: `translateX(-50%) rotate(${index * 36}deg)`,
                transformOrigin: '50% 86px'
              }}
            >
              <span style={{ transform: `rotate(-${index * 36}deg)` }}>
                {numeral}
              </span>
            </div>
          ))}
        </div>
        
        {/* Inner Ring */}
        <div 
          className="absolute inset-4 border-4 border-amber-500 rounded-full bg-amber-700"
          style={{ transform: `rotate(${innerRing}deg)` }}
        >
          {letters.map((letter, index) => (
            <div
              key={`inner-${index}`}
              className="absolute w-6 h-6 text-center font-bold"
              style={{
                top: '10px',
                left: '50%',
                transform: `translateX(-50%) rotate(${index * 36}deg)`,
                transformOrigin: '50% 70px'
              }}
            >
              <span style={{ transform: `rotate(-${index * 36}deg)` }}>
                {letter}
              </span>
            </div>
          ))}
        </div>
        
        {/* Center indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-red-600 rounded-full"></div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">Outer Ring (Arabic):</span>
          <div className="space-x-2">
            <button 
              onClick={() => rotateCipherWheel(-1, 'outer')}
              className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-700"
            >
              ↺
            </button>
            <button 
              onClick={() => rotateCipherWheel(1, 'outer')}
              className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-700"
            >
              ↻
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Inner Ring (Letters):</span>
          <div className="space-x-2">
            <button 
              onClick={() => rotateCipherWheel(-1, 'inner')}
              className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-700"
            >
              ↺
            </button>
            <button 
              onClick={() => rotateCipherWheel(1, 'inner')}
              className="bg-amber-600 px-3 py-1 rounded hover:bg-amber-700"
            >
              ↻
            </button>
          </div>
        </div>
      </div>
      
      {/* Decoded Message */}
      <div className="mt-4 p-3 bg-stone-800 rounded">
        <p className="text-sm mb-1">Decoded Message:</p>
        <p className={`font-mono text-lg ${isSolved ? 'text-green-400' : 'text-amber-300'}`}>
          {decodedMessage || '----'}
        </p>
        {isSolved && (
          <p className="text-green-400 text-sm mt-2 animate-pulse">
            ✅ Cipher solved! The secret word is revealed.
          </p>
        )}
      </div>
      
      {/* Hint */}
      <div className="mt-3 p-2 bg-amber-800 rounded text-xs">
        💡 Hint: The message contains 4 letters. Look for Ottoman military terms.
      </div>
    </div>
  );
};

// QR Code Scanner Component using ZXing
const QRCodeScanner = ({ onQRDetected, isActive }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Initialize QR code reader
    readerRef.current = new BrowserQRCodeReader();
    
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setScanResult(null);
      
      // Get available video input devices
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      
      // Find back camera (environment facing)
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      );
      
      const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0]?.deviceId;
      
      if (!selectedDeviceId) {
        throw new Error('No video input devices found');
      }

      setIsScanning(true);
      
      // Start decoding from video device
      const result = await readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const qrText = result.getText();
            console.log('QR Code detected:', qrText);
            
            // Check if this is a valid Ottoman game QR code
            if (isValidGameQRCode(qrText)) {
              setLastScannedCode(qrText);
              setScanResult(`QR Code found: ${qrText}`);
              onQRDetected(qrText);
              stopScanning();
            }
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.error('QR scanning error:', error);
          }
        }
      );
      
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setError(error.message);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (readerRef.current) {
      readerRef.current.reset();
    }
  };

  // Validate if QR code is part of the Ottoman game
  const isValidGameQRCode = (code) => {
    const validCodes = [
      'SKIFA_KAHLA_ENTRANCE',
      'OTTOMAN_SECRET_PASSAGE', 
      'FORTRESS_HIDDEN_ROOM',
      'CIPHER_KEY_LOCATION',
      'HOLLOW_WALL_MARKER',
      'TREASURE_COMPARTMENT',
      'GATE_MECHANISM_CLUE',
      'MAP_FRAGMENT_1',
      'MAP_FRAGMENT_2',
      'MAP_FRAGMENT_3',
      'MAP_FRAGMENT_4'
    ];
    
    return validCodes.includes(code) || code.startsWith('OTTOMAN_') || code.startsWith('SKIFA_');
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="bg-stone-900 p-4 rounded-lg text-stone-100">
      <h3 className="font-bold mb-3">📱 Ottoman QR Scanner</h3>
      <p className="text-sm mb-3">Scan QR codes hidden around Skifa Kahla</p>
      
      {!isScanning ? (
        <div className="text-center">
          <button
            onClick={startScanning}
            disabled={!isActive}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 px-6 py-3 rounded-lg font-bold"
          >
            📷 Start QR Scan
          </button>
          
          {scanResult && (
            <div className="mt-3 p-3 bg-green-900 text-green-100 rounded">
              {scanResult}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <video 
              ref={videoRef}
              className="w-full rounded-lg"
              playsInline
              muted
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
            
            {/* Scanning overlay with targeting square */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400"></div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-x-0 top-0 h-1 bg-blue-400 animate-pulse"></div>
                
                {/* Status text */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                    🔍 Scanning for Ottoman QR codes...
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={stopScanning}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg"
          >
            ⏹️ Stop Scanning
          </button>
          
          {/* Scanning tips */}
          <div className="text-xs text-stone-400 bg-stone-800 p-2 rounded">
            💡 Tips: Hold steady, ensure good lighting, position QR code within the square
          </div>
        </div>
      )}
      
      {/* QR Code History */}
      {lastScannedCode && (
        <div className="mt-4 p-3 bg-stone-800 rounded">
          <p className="text-sm text-stone-300">Last scanned:</p>
          <p className="font-mono text-green-400 break-all">{lastScannedCode}</p>
          <p className="text-xs text-stone-400 mt-1">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
      
      {/* Valid QR Code Format Guide */}
      <div className="mt-3 p-2 bg-amber-900 rounded text-xs">
        <p className="font-medium text-amber-200 mb-1">🏺 Expected QR Codes:</p>
        <ul className="text-amber-300 space-y-1">
          <li>• SKIFA_KAHLA_ENTRANCE</li>
          <li>• MAP_FRAGMENT_[1-4]</li>
          <li>• OTTOMAN_SECRET_PASSAGE</li>
          <li>• CIPHER_KEY_LOCATION</li>
        </ul>
      </div>
    </div>
  );
};

// Main Game Component Integration
const OttomanGameFeatures = () => {
  const [activeFeature, setActiveFeature] = useState('audio');
  const [gameProgress, setGameProgress] = useState({
    hollowWallFound: false,
    cipherSolved: false,
    qrCodesFound: []
  });

  const handleHollowWallDetected = (strength) => {
    console.log(`Hollow wall detected with strength: ${strength}`);
    setGameProgress(prev => ({ ...prev, hollowWallFound: true }));
  };

  const handleCipherSolved = () => {
    console.log('Cipher wheel solved!');
    setGameProgress(prev => ({ ...prev, cipherSolved: true }));
  };

  const handleQRDetected = (code) => {
    console.log(`QR code detected: ${code}`);
    setGameProgress(prev => ({
      ...prev,
      qrCodesFound: [...prev.qrCodesFound, code]
    }));
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-amber-400">
          🏰 Ottoman Espionage Tools
        </h1>
        
        {/* Feature Selector */}
        <div className="flex mb-6 bg-stone-800 rounded-lg p-1">
          <button
            onClick={() => setActiveFeature('audio')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
              activeFeature === 'audio' 
                ? 'bg-amber-600 text-white' 
                : 'text-stone-300 hover:text-white'
            }`}
          >
            🎤 Echo Detection
          </button>
          <button
            onClick={() => setActiveFeature('cipher')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
              activeFeature === 'cipher' 
                ? 'bg-amber-600 text-white' 
                : 'text-stone-300 hover:text-white'
            }`}
          >
            🔤 Cipher Wheel
          </button>
          <button
            onClick={() => setActiveFeature('qr')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
              activeFeature === 'qr' 
                ? 'bg-amber-600 text-white' 
                : 'text-stone-300 hover:text-white'
            }`}
          >
            📱 QR Scanner
          </button>
        </div>
        
        {/* Active Feature Component */}
        <div className="mb-6">
          {activeFeature === 'audio' && (
            <AudioEchoDetector 
              onHollowWallDetected={handleHollowWallDetected}
              isActive={true}
            />
          )}
          
          {activeFeature === 'cipher' && (
            <CipherWheel 
              onSolved={handleCipherSolved}
              isActive={true}
            />
          )}
          
          {activeFeature === 'qr' && (
            <QRCodeScanner 
              onQRDetected={handleQRDetected}
              isActive={true}
            />
          )}
        </div>
        
        {/* Game Progress */}
        <div className="bg-stone-800 p-4 rounded-lg">
          <h3 className="font-bold mb-3">📊 Mission Progress</h3>
          <div className="space-y-2">
            <div className={`flex items-center ${gameProgress.hollowWallFound ? 'text-green-400' : 'text-stone-400'}`}>
              <span className="mr-2">{gameProgress.hollowWallFound ? '✅' : '⏳'}</span>
              <span className="text-sm">Hollow wall detected</span>
            </div>
            <div className={`flex items-center ${gameProgress.cipherSolved ? 'text-green-400' : 'text-stone-400'}`}>
              <span className="mr-2">{gameProgress.cipherSolved ? '✅' : '⏳'}</span>
              <span className="text-sm">Ottoman cipher decoded</span>
            </div>
            <div className={`flex items-center ${gameProgress.qrCodesFound.length > 0 ? 'text-green-400' : 'text-stone-400'}`}>
              <span className="mr-2">{gameProgress.qrCodesFound.length > 0 ? '✅' : '⏳'}</span>
              <span className="text-sm">QR codes found ({gameProgress.qrCodesFound.length})</span>
            </div>
          </div>
          
          {gameProgress.qrCodesFound.length > 0 && (
            <div className="mt-3 p-2 bg-stone-700 rounded">
              <p className="text-sm font-medium mb-1">Found codes:</p>
              {gameProgress.qrCodesFound.map((code, index) => (
                <p key={index} className="text-xs text-green-400 font-mono">
                  • {code}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OttomanGameFeatures;