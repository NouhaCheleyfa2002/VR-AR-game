import MultiplayerRoom from '../models/MultiplayerRoom.js';
import { protect, authorize } from '../middleware/auth.js';

// @desc    Get all multiplayer rooms
// @route   GET /api/rooms
// @access  Private
export const getAllRooms = [
  protect,
  async (req, res) => {
    try {
      const rooms = await MultiplayerRoom.find()
        .populate('qrCode')
        .populate('participants')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

export const getRoomById = [
  protect,
  async (req, res) => {
    try {
      const room = await MultiplayerRoom.findById(req.params.id)
        .populate('qrCode')
        .populate('participants');

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

export const getRoomByCode = [
  protect,
  async (req, res) => {
    try {
      const room = await MultiplayerRoom.findOne({ 
        accesscode: req.params.code,
        isActive: true 
      })
        .populate('qrCode')
        .populate('participants');

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found or inactive'
        });
      }

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

export const createRoom = [
  protect,
  async (req, res) => {
    try {
      const { qrCode, accesscode, participants, roomStatus, startGame } = req.body;

      // Validate required fields
      if (!qrCode || !accesscode) {
        return res.status(400).json({
          success: false,
          message: 'Please provide qrCode and accesscode'
        });
      }

      // Check if accesscode already exists
      const existingRoom = await MultiplayerRoom.findOne({ accesscode });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Access code already exists'
        });
      }

      const roomData = {
        qrCode,
        accesscode,
        participants: participants || [],
        roomStatus: roomStatus || 'open',
        startGame: startGame || false
      };

      const room = await MultiplayerRoom.create(roomData);
      
      // Populate the created room
      const populatedRoom = await MultiplayerRoom.findById(room._id)
        .populate('qrCode')
        .populate('participants');

      res.status(201).json({
        success: true,
        data: populatedRoom
      });
    } catch (error) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages
        });
      }

      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Access code already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

export const updateRoom = [
  protect,
  async (req, res) => {
    try {
      const { qrCode, accesscode, participants, roomStatus, startGame, isActive } = req.body;

      let room = await MultiplayerRoom.findById(req.params.id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Check if new accesscode conflicts with existing ones (if accesscode is being updated)
      if (accesscode && accesscode !== room.accesscode) {
        const existingRoom = await MultiplayerRoom.findOne({ accesscode });
        if (existingRoom) {
          return res.status(400).json({
            success: false,
            message: 'Access code already exists'
          });
        }
      }

      // Update fields
      const updateData = {};
      if (qrCode !== undefined) updateData.qrCode = qrCode;
      if (accesscode !== undefined) updateData.accesscode = accesscode;
      if (participants !== undefined) updateData.participants = participants;
      if (roomStatus !== undefined) updateData.roomStatus = roomStatus;
      if (startGame !== undefined) updateData.startGame = startGame;
      if (isActive !== undefined) updateData.isActive = isActive;

      room = await MultiplayerRoom.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true
        }
      )
        .populate('qrCode')
        .populate('participants');

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages
        });
      }

      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Access code already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

export const deleteRoom = [
  protect,
  async (req, res) => {
    try {
      const room = await MultiplayerRoom.findById(req.params.id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      await MultiplayerRoom.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];
