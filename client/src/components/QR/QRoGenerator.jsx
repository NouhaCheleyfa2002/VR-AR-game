//mocked with localstate
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

const QRCodeGenerator = ({ onGenerate }) => {
  const [form, setForm] = useState({
    roomId: '',
    gameId: '',
    culturalElementId: '',
    content: '',
    maxScans: 5,
    expirationTime: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = () => {
    if (!form.roomId || !form.gameId || !form.expirationTime) {
      toast.error('Please fill all required fields');
      return;
    }

    const newQRCode = {
      ...form,
      codeId: Math.floor(Math.random() * 100000),
      scans: 0,
    };

    onGenerate(newQRCode);
    toast.success('QR Code generated!');
    setForm({
      roomId: '',
      gameId: '',
      culturalElementId: '',
      content: '',
      maxScans: 5,
      expirationTime: '',
    });
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, p: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Generate New QR Code
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Room ID"
            name="roomId"
            value={form.roomId}
            onChange={handleChange}
            required
          />
          <TextField
            label="Game ID"
            name="gameId"
            value={form.gameId}
            onChange={handleChange}
            required
          />
          <TextField
            label="Cultural Element ID"
            name="culturalElementId"
            value={form.culturalElementId}
            onChange={handleChange}
          />
          <TextField
            label="Content"
            name="content"
            value={form.content}
            onChange={handleChange}
          />
          <TextField
            label="Max Scans"
            name="maxScans"
            type="number"
            value={form.maxScans}
            onChange={handleChange}
          />
          <TextField
            label="Expiration Time"
            name="expirationTime"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={form.expirationTime}
            onChange={handleChange}
            required
          />
          <Button variant="contained" onClick={handleGenerate}>
            Generate Code
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
