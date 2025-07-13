import React from 'react';

const QRCodeDisplay = ({ value }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(value)}`;
  return <img src={qrUrl} alt="QR Code" />;
};

export default QRCodeDisplay;
