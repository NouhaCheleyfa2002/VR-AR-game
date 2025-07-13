// pages/QRCodeManagerPage.jsx
import React, { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import QRCodeCard from '../../components/QR/QRCodeCard';
import QRCodeGenerator from '../../components/QR/QRoGenerator';
import QRCodeScanner from '../../components/QR/QRodeScanner';

const QRCodeManagerPage = () => {
  const [codes, setCodes] = useState([{
    codeId: 101,
    roomId: 1,
    gameId: 10,
    culturalElementId: 5,
    content: 'Join Room 1 – Andalusian Tower',
    maxScans: 3,
    scans: 1,
    expirationTime: '2025-07-04T23:00:00Z',
  },
  {
    codeId: 102,
    roomId: 2,
    gameId: 11,
    culturalElementId: 8,
    content: 'Join Room 2 – Roman Mosaic',
    maxScans: 5,
    scans: 5,
    expirationTime: '2025-07-03T20:00:00Z', // expired
  },]);

  const handleGenerate = (newCode) => {
    setCodes([...codes, newCode]);
  };

  const handleScanJoin = (updatedCode) => {
    setCodes((prev) =>
      prev.map((code) =>
        code.codeId === updatedCode.codeId ? updatedCode : code
      )
    );
  };

  return (
    <>
      <Typography variant="h4" className='p-5 text-center' gutterBottom>
        QR Code Management
      </Typography>
      <Grid container spacing={3} className="justify-center">
        <Grid item xs={12} md={6}>
          <QRCodeGenerator onGenerate={handleGenerate} />
        </Grid>
        <Grid item xs={12} md={6}>
          <QRCodeScanner qrCodes={codes} onJoinRoom={handleScanJoin} />
        </Grid>
        {codes.map((code) => (
          <Grid item xs={12} md={6} key={code.codeId}>
            <QRCodeCard code={code} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default QRCodeManagerPage;
