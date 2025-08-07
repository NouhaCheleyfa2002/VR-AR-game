import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// GET /api/qrcodes - Get all QR codes
export const getAllQRCodes = async () => {
  try {
    const response = await axios.get(`${backendUrl}/QRcode`);
    const data = response.data.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return [];
  }
};

// GET /api/qrcodes/:id - Get QR code by ID
export const getQRCodeById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/QRcode/${id}`);
    const data = response.data.data || {};
    return data;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    throw error;
  }
};

// POST /api/qrcodes/scan - Scan QR code and validate
export const scanQRCode = async (qrCodeData) => {
  try {
    const response = await axios.post(`${backendUrl}/QRcode/scan`, {
      qrCode: qrCodeData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    const data = response.data.data || {};
    return {
      success: response.data.success || false,
      data: data,
      message: response.data.message || '',
      location: data.location || null,
      gameId: data.gameId || null,
      roomId: data.roomId || null
    };
  } catch (error) {
    console.error('Error scanning QR code:', error);
    
    // Return structured error response
    if (error.response) {
      return {
        success: false,
        data: null,
        message: error.response.data.message || 'Invalid QR code',
        error: error.response.data.error || 'SCAN_FAILED'
      };
    }
    
    throw error;
  }
};

// GET /api/qrcodes/room/:roomId - Get QR codes by room
export const getQRCodesByRoom = async (roomId) => {
  try {
    const response = await axios.get(`${backendUrl}/QRcode/room/${roomId}`);
    const data = response.data.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching QR codes by room:', error);
    return [];
  }
};

// GET /api/qrcodes/game/:gameId - Get QR codes by game
export const getQRCodesByGame = async (gameId) => {
  try {
    const response = await axios.get(`${backendUrl}/QRcode/game/${gameId}`);
    const data = response.data.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching QR codes by game:', error);
    return [];
  }
};

// POST /api/qrcodes - Create new QR code
export const createQRCode = async (qrCodeData) => {
  try {
    const response = await axios.post(`${backendUrl}/QRcode`, qrCodeData);
    
    const data = response.data.data || {};
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error creating QR code:', error);
    throw error;
  }
};

// PUT /api/qrcodes/:id - Update QR code
export const updateQRCode = async (id, qrCodeData) => {
  try {
    const response = await axios.put(`${backendUrl}/QRcode/${id}`, qrCodeData);
    const data = response.data.data || {};
    return data;
  } catch (error) {
    console.error('Error updating QR code:', error);
    throw error;
  }
};

// DELETE /api/qrcodes/:id - Delete QR code
export const deleteQRCode = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/QRcode/${id}`);
    const data = response.data.data || {};
    return data;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
};




