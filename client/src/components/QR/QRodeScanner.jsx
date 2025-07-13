// components/qrcode/QRCodeScanner.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
} from '@mui/material';
import { toast } from 'react-toastify';
import { isExpired, scanCode, validateCodeScan } from './QRCodeUtils';

const QRCodeScanner = ({ qrCodes, onJoinRoom }) => {
  const [inputCodeId, setInputCodeId] = useState('');

  const handleScan = () => {
    const foundCode = qrCodes.find((code) => code.codeId.toString() === inputCodeId);

    if (!foundCode) {
      toast.error('QR Code not found');
      return;
    }

    if (isExpired(foundCode)) {
      toast.warning('QR Code is expired');
      return;
    }

    if (!validateCodeScan(foundCode)) {
      toast.warning('Scan limit reached');
      return;
    }

    const updatedCode = scanCode(foundCode);
    onJoinRoom(updatedCode);
    toast.success('QR Code scanned successfully. Joining room...');
    setInputCodeId('');
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, p: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Scan QR Code to Join Room
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Enter QR Code ID"
            value={inputCodeId}
            onChange={(e) => setInputCodeId(e.target.value)}
          />
          <Button variant="contained" onClick={handleScan}>
            Scan & Join
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
