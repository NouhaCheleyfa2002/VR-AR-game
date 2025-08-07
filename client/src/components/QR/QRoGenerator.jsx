import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Typography
} from '@mui/material';
import { createQRCode } from '../../api/QRCodeApi';

const QRCodeGenerator = ({ onGenerate }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    content: '',
    maxScans: 5,
    expirationDate: ''
  });
  const [qrImage, setQrImage] = useState('');
  const [error, setError] = useState('');

  const generateRoomContent = () => {
    return `ROOM_${formData.roomId}_${Date.now()}`;
  };

  const handleSubmit = async () => {
    try {
      if (!formData.roomId) {
        throw new Error('Room ID is required');
      }

      const content = generateRoomContent();
      const qrData = {
        ...formData,
        content,
        type: 'room'
      };

      const createdQR = await createQRCode(qrData);
      onGenerate(createdQR);
      
      setQrImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(content)}`);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        fullWidth
      >
        Generate Room QR Code
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Room QR Code</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            name="roomId"
            label="Room ID"
            value={formData.roomId}
            onChange={(e) => setFormData({...formData, roomId: e.target.value})}
          />

          <TextField
            fullWidth
            margin="normal"
            name="maxScans"
            label="Max Scans"
            type="number"
            value={formData.maxScans}
            onChange={(e) => setFormData({...formData, maxScans: e.target.value})}
          />

          <TextField
            fullWidth
            margin="normal"
            name="expirationDate"
            label="Expiration Date"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={formData.expirationDate}
            onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          {qrImage && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <img 
                src={qrImage} 
                alt="Generated QR Code" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <Typography variant="caption" display="block">
                Content: {formData.content}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            color="primary"
            variant="contained"
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QRCodeGenerator;