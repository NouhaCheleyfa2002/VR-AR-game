import QRCode from '../models/QRCode.js';

// ... (keep all your existing CRUD functions)

export const getAllQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find({})
      .populate('roomId', 'name status')
      .populate('gameId', 'title difficulty')
      .populate('associatedRooms', 'name status');
    
    res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching QR codes',
      error: error.message
    });
  }
};

export const getQRCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findById(id)
      .populate('roomId', 'name status')
      .populate('gameId', 'title difficulty')
      .populate('associatedRooms', 'name status');
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching QR code',
      error: error.message
    });
  }
};

export const createQRCode = async (req, res) => {
  try {
    const qrCodeData = req.body;
    
    if (!qrCodeData.roomId && !qrCodeData.gameId) {
      return res.status(400).json({
        success: false,
        message: 'Either roomId or gameId must be provided'
      });
    }
    
    if (qrCodeData.expirationDate && new Date(qrCodeData.expirationDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiration date must be in the future'
      });
    }
    
    const qrCode = new QRCode(qrCodeData);
    const savedQRCode = await qrCode.save();
    
    const populatedQRCode = await QRCode.findById(savedQRCode._id)
      .populate('roomId', 'name status')
      .populate('gameId', 'title difficulty')
      .populate('associatedRooms', 'name status');
    
    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      data: populatedQRCode
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating QR code',
      error: error.message
    });
  }
};

export const updateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.expirationDate && new Date(updateData.expirationDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiration date must be in the future'
      });
    }
    
    const qrCode = await QRCode.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('roomId', 'name status')
      .populate('gameId', 'title difficulty')
      .populate('associatedRooms', 'name status');
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'QR code updated successfully',
      data: qrCode
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating QR code',
      error: error.message
    });
  }
};

export const deleteQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findByIdAndDelete(id);
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'QR code deleted successfully',
      data: qrCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting QR code',
      error: error.message
    });
  }
};

// SIMPLIFIED: Just validate and return QR code data
export const scanQRCode = async (req, res) => {
  try {
    const { content, roomId, gameId } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'QR code content is required'
      });
    }

    // Find QR code by content
    const qrCode = await QRCode.findOne({ content })
      .populate('roomId', 'name status maxPlayers currentPlayers')
      .populate('gameId', 'title difficulty status')
      .populate('associatedRooms', 'name status');

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found or invalid'
      });
    }

    // Basic validations
    if (qrCode.expirationDate && new Date() > qrCode.expirationDate) {
      return res.status(410).json({
        success: false,
        message: 'QR code has expired'
      });
    }

    if (qrCode.maxScans && qrCode.scanCount >= qrCode.maxScans) {
      return res.status(410).json({
        success: false,
        message: 'QR code scan limit reached'
      });
    }

    // Return raw QR code data - let frontend decide what to do with it
    res.status(200).json({
      success: true,
      data: {
        _id: qrCode._id,
        content: qrCode.content,
        roomId: qrCode.roomId,
        gameId: qrCode.gameId,
        maxScans: qrCode.maxScans,
        expirationDate: qrCode.expirationDate,
        scannedAt: new Date()
      }
    });

  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing QR code scan',
      error: error.message
    });
  }
};

// Utility endpoints
export const getQRCodesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const qrCodes = await QRCode.find({
      $or: [
        { roomId: roomId },
        { associatedRooms: roomId }
      ]
    })
      .populate('gameId', 'title difficulty')
      .populate('associatedRooms', 'name status');
    
    res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching QR codes for room',
      error: error.message
    });
  }
};

export const getQRCodesByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const qrCodes = await QRCode.find({ gameId })
      .populate('roomId', 'name status')
      .populate('associatedRooms', 'name status');
    
    res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching QR codes for game',
      error: error.message
    });
  }
};