import React, { useState } from 'react';

const QRCodeGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  // Generate QR code using QR Server API
  const generateQRCode = () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    try {
      // Create the room URL that your scanner expects
      const roomUrl = `${window.location.origin}/rooms/${roomId.trim()}`;
      
      // Generate QR code using QR Server API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(roomUrl)}`;
      
      setQrCodeUrl(qrApiUrl);
      setError('');
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    }
  };

  // Download QR code
  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `room-${roomId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download QR code');
    }
  };

  // Copy room URL to clipboard
  const copyRoomUrl = async () => {
    const roomUrl = `${window.location.origin}/rooms/${roomId.trim()}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      alert('Room URL copied to clipboard!');
    } catch (err) {
      setError('Failed to copy URL');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQrCodeUrl('');
    setRoomId('');
    setError('');
  };

  // Generate a random room ID
  const generateRandomRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setRoomId(result);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Button to open QR generator */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'linear-gradient(45deg, #2196f3, #1976d2)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'linear-gradient(45deg, #1976d2, #1565c0)';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'linear-gradient(45deg, #2196f3, #1976d2)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        📱 Generate QR Code
      </button>

      {/* QR Generator Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              borderBottom: '1px solid #e5e5e5',
              paddingBottom: '16px',
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>Generate Room QR Code</h2>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Room ID Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#555',
              }}>
                Room ID
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room ID (e.g., ABC123)"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
                <button
                  onClick={generateRandomRoomId}
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #2196f3',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#2196f3',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Random
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateQRCode}
              disabled={!roomId.trim()}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: roomId.trim() ? '#2196f3' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: roomId.trim() ? 'pointer' : 'not-allowed',
                marginBottom: '24px',
                transition: 'all 0.3s ease',
              }}
            >
              Generate QR Code
            </button>

            {/* Error Display */}
            {error && (
              <div style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #ffcdd2',
              }}>
                {error}
              </div>
            )}

            {/* QR Code Display */}
            {qrCodeUrl && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#333', marginBottom: '16px' }}>
                  QR Code for Room: {roomId}
                </h3>
                
                <div style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  backgroundColor: '#fff',
                  display: 'inline-block',
                }}>
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code for room ${roomId}`}
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <button
                    onClick={downloadQRCode}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Download
                  </button>
                  
                  <button
                    onClick={copyRoomUrl}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                     Copy URL
                  </button>
                </div>

                {/* Room URL Display */}
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  wordBreak: 'break-all',
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                }}>
                  <strong>Room URL:</strong> {window.location.origin}/rooms/{roomId}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;