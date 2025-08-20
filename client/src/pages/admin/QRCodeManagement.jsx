import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Box,
  Paper,
  Divider,
  Fade,
  Chip
} from '@mui/material';
import { QrCode as QrCodeIcon, Add as AddIcon } from '@mui/icons-material';
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

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading QR Codes...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Fade in timeout={800}>
        <Box mb={6}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <QrCodeIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              color="primary.main"
              textAlign="center"
            >
              QR Code Management
            </Typography>
          </Box>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            maxWidth="600px"
            mx="auto"
          >
            Create, manage, and organize your QR codes in one place
          </Typography>
        </Box>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Fade in>
          <Box mb={4}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        </Fade>
      )}

      {/* QR Code Generators Section */}
      <Fade in timeout={1000}>
        <Paper elevation={2} sx={{ p: 4, mb: 6, borderRadius: 3 }}>
          <Box mb={3}>
            <Typography
              variant="h4"
              gutterBottom
              display="flex"
              alignItems="center"
              color="text.primary"
            >
              <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
              Create New QR Code
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} lg={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 4,
                  }
                }}
              >
                <Typography variant="h6" gutterBottom color="primary.main" fontWeight="medium">
                  Standard QR Code Generator
                </Typography>
                <QRCodeGenerator onGenerate={handleGenerate} />
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={6}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'secondary.light',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    boxShadow: 4,
                  }
                }}
              >
                <Typography variant="h6" gutterBottom color="secondary.main" fontWeight="medium">
                  Game QR Code Generator
                </Typography>
                <GameQRCodeGenerator onGenerate={handleGenerate} />
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* QR Codes Collection Section */}
      <Fade in timeout={1200}>
        <Box>
          <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" color="text.primary">
              Your QR Codes
            </Typography>
            <Chip
              label={`${codes.length} ${codes.length === 1 ? 'Code' : 'Codes'}`}
              color="primary"
              variant="outlined"
              size="medium"
            />
          </Box>

          {codes.length === 0 ? (
            <Paper
              elevation={1}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: 'grey.50'
              }}
            >
              <QrCodeIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No QR Codes Yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your first QR code using the generators above
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {codes.map((code, index) => (
                <Grid item xs={12} sm={6} lg={4} xl={3} key={code._id}>
                  <Fade in timeout={300 * (index + 1)}>
                    <Box>
                      <QRCodeCard
                        code={code}
                        onDelete={() => handleDelete(code._id)}
                      />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default QRCodeManagerPage;