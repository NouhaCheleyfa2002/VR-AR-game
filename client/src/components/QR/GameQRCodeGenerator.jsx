import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';
import { createQRCode } from '../../api/QRCodeApi';

const GameQRCodeGenerator = ({ onGenerate }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    gameId: '',
    content: '',
    maxScans: 10,
    expirationDate: ''
  });
  const [qrImage, setQrImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateContentString = () => {
    return `GAME_${formData.gameId}_${Date.now()}`;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation
      if (!formData.gameId || formData.gameId.trim() === '') {
        throw new Error('Game ID is required');
      }

      // Ensure gameId is a valid string (trim whitespace)
      const trimmedGameId = formData.gameId.trim();
      
      // Validate maxScans
      const maxScans = parseInt(formData.maxScans);
      if (isNaN(maxScans) || maxScans < 1) {
        throw new Error('Max scans must be a positive number');
      }

      // Handle expiration date - ensure it's either null or a valid ISO string
      let expirationDate = null;
      if (formData.expirationDate && formData.expirationDate.trim() !== '') {
        const expDate = new Date(formData.expirationDate);
        if (isNaN(expDate.getTime())) {
          throw new Error('Invalid expiration date');
        }
        // Check if expiration date is in the future
        if (expDate <= new Date()) {
          throw new Error('Expiration date must be in the future');
        }
        expirationDate = expDate.toISOString();
      }

      // Generate content
      const content = `GAME_${trimmedGameId}_${Date.now()}`;

      // Prepare QR data - make sure structure matches your API expectations
      const qrData = {
        gameId: trimmedGameId, // Send as string, not object
        content: content,
        maxScans: maxScans,
        expirationDate: expirationDate,
        type: 'game'
      };

      // Create QR code via API
      const apiResponse = await createQRCode(qrData);

      // Handle different response structures
      // If response has a 'data' wrapper, use that, otherwise use the response directly
      const createdQR = apiResponse.data || apiResponse;

      // Call parent callback
      if (onGenerate) {
        onGenerate(createdQR);
      }
      
      // Generate QR image URL
      setQrImage(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(content)}`);
      
      // Update form data to show the generated content
      setFormData(prev => ({ ...prev, content }));
      
      
    } catch (err) {
      console.error('QR Generation failed:', err);
      
      // Extract error message
      let errorMessage = 'Failed to generate QR code';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      gameId: '',
      content: '',
      maxScans: 10,
      expirationDate: ''
    });
    setQrImage('');
    setError('');
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    setError(''); // Clear any previous errors
    setQrImage(''); // Clear previous QR image
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleOpen}
        fullWidth
      >
        Generate Game QR Code
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Game QR Code</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            name="gameId"
            label="Game ID"
            value={formData.gameId}
            onChange={handleChange}
            required
            helperText="Enter the ID of the game this QR code will be associated with"
            error={!formData.gameId && error.includes('Game ID')}
          />

          <TextField
            fullWidth
            margin="normal"
            name="maxScans"
            label="Max Scans"
            type="number"
            value={formData.maxScans}
            onChange={handleChange}
            inputProps={{ min: 1, max: 1000 }}
            helperText="Maximum number of times this QR code can be scanned"
          />

          <TextField
            fullWidth
            margin="normal"
            name="expirationDate"
            label="Expiration Date (Optional)"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={formData.expirationDate}
            onChange={handleChange}
            helperText="Leave empty for no expiration"
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              {error}
            </Typography>
          )}

          {qrImage && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <img 
                src={qrImage} 
                alt="Generated QR Code" 
                style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: 8 }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Content: {formData.content}
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary">
                Game ID: {formData.gameId}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                ✅ QR Code Generated Successfully!
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading || !formData.gameId.trim()}
          >
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameQRCodeGenerator;