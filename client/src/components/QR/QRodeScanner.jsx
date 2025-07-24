import { useEffect, useRef, useState } from 'react';

const NativeQRScanner = ({ onScan, onError }) => {
  const videoRef = useRef(null);
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // Check if browser supports BarcodeDetector API
    if ('BarcodeDetector' in window) {
      setHasBarcodeDetector(true);
    } else {
      onError?.('Your browser doesn\'t support QR scanning. Try Chrome or Edge.');
    }
  }, []);

  const startScanning = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      videoRef.current.srcObject = stream;
      
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const detectFrame = async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              onScan?.(barcodes[0].rawValue);
              stopScanning();
            }
          } catch (err) {
            // Continue scanning
          }
          if (scanning) requestAnimationFrame(detectFrame);
        }
      };
      detectFrame();
    } catch (err) {
      onError?.(err.message);
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (hasBarcodeDetector) {
      startScanning();
    }
    return stopScanning;
  }, [hasBarcodeDetector]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* Scanner overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        border: '2px solid #c9b037',
        borderRadius: '8px'
      }}>
        <div style={{
          position: 'absolute',
          top: '-3px',
          left: '-3px',
          width: '20px',
          height: '20px',
          border: '3px solid #c9b037',
          borderRight: 'none',
          borderBottom: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: '-3px',
          right: '-3px',
          width: '20px',
          height: '20px',
          border: '3px solid #c9b037',
          borderLeft: 'none',
          borderBottom: 'none'
        }} />
      </div>
      {!hasBarcodeDetector && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white'
        }}>
          QR scanning not supported in this browser
        </div>
      )}
    </div>
  );
};

export default NativeQRScanner;