import React, { useState, useEffect } from 'react';
import { Grid, Typography, CircularProgress, Alert } from '@mui/material';
import QRCodeCard from '../../components/QR/QRCodeCard';
import QRCodeGenerator from '../../components/QR/QRoGenerator';
import GameQRCodeGenerator from '../../components/QR/GameQRCodeGenerator';
import {
  getAllQRCodes,
  createQRCode,
  updateQRCode,
  deleteQRCode
} from '../../api/QRCodeApi';

const QRCodeManagerPage = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all QR codes from API
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const qrCodes = await getAllQRCodes();
        setCodes(qrCodes);
      } catch (err) {
        setError(err.message || 'Failed to load QR codes');
      } finally {
        setLoading(false);
      }
    };
    fetchCodes();
  }, []);

  // This function is called when a QR code is already created by child components
  // The 'createdCode' parameter is already a complete QR code object from the API
  const handleGenerate = (createdCode) => {
    try {
      console.log('Adding created QR code to list:', createdCode);
      
      // Simply add the already-created QR code to the state
      setCodes(prevCodes => [...prevCodes, createdCode]);
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error('Error adding QR code to list:', err);
      setError('Failed to add QR code to list');
    }
  };

  // This function can be used if you want to create QR codes directly from the parent
  const handleCreateQRCode = async (qrData) => {
    try {
      const createdCode = await createQRCode(qrData);
      setCodes(prevCodes => [...prevCodes, createdCode]);
      return createdCode;
    } catch (err) {
      setError(err.message || 'Failed to generate QR code');
      throw err;
    }
  };

  const handleDelete = async (codeId) => {
    try {
      await deleteQRCode(codeId);
      setCodes(codes.filter(c => c._id !== codeId));
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message || 'Failed to delete QR code');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

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
          <GameQRCodeGenerator onGenerate={handleGenerate} />
        </Grid>
        
        {codes.map((code) => (
          <Grid item xs={12} md={6} key={code._id}>
            <QRCodeCard 
              code={code}
              onDelete={() => handleDelete(code._id)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default QRCodeManagerPage;