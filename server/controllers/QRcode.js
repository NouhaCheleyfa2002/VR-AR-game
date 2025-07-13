import QRCode from '../models/QRCode.js';


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
    
    // Validate that at least one of roomId or gameId is provided
    if (!qrCodeData.roomId && !qrCodeData.gameId) {
      return res.status(400).json({
        success: false,
        message: 'Either roomId or gameId must be provided'
      });
    }
    
    // Validate expiration date if provided
    if (qrCodeData.expirationDate && new Date(qrCodeData.expirationDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiration date must be in the future'
      });
    }
    
    const qrCode = new QRCode(qrCodeData);
    const savedQRCode = await qrCode.save();
    
    // Populate the saved QR code for response
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
    
    // Validate expiration date if being updated
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