import MultiplayerRoom from '../models/MultiplayerRoom.js';
import { protect, authorize } from '../middleware/auth.js';
import RoomParticipant from'../models/RoomParticipant.js';
import EscapeGame from '../models/EscapeGame.js';

export const getAllRooms = [

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

// join room
export const joinRoom = async (req, res) => {
  const { id: roomId } = req.params;
  const playerId = req.user?.id; 
  
  console.log('Join room request:', { roomId, playerId, userExists: !!req.user });
  
  if (!roomId) {
    return res.status(400).json({ 
      success: false,
      error: 'Room ID is required' 
    });
  }
  
  if (!playerId) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required - Player ID not found' 
    });
  }

  try {
    const room = await MultiplayerRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ 
        success: false,
        error: 'Room not found' 
      });
    }

    if (!room.isActive || room.roomStatus === 'closed') {
      return res.status(403).json({ 
        success: false,
        error: 'Room is not accepting new players' 
      });
    }
    
    const participantsCount = await RoomParticipant.countDocuments({ roomId });
    const maxPlayers = room.maxPlayers || 6;
    
    console.log('Room capacity:', { current: participantsCount, max: maxPlayers });
    
    if (participantsCount >= maxPlayers) {
      return res.status(403).json({ 
        success: false,
        error: 'Room is full' 
      });
    }

    const existingParticipant = await RoomParticipant.findOne({ roomId, playerId });
    if (existingParticipant) {
      console.log('Player already in room:', existingParticipant);
      return res.status(200).json({
        success: true,
        message: 'Already in room',
        data: {
          participant: existingParticipant,
          room
        }
      });
    }

    const newParticipant = await RoomParticipant.create({
      roomId,
      playerId,
      joinedAt: new Date(),
      isHost: participantsCount === 0, 
      isReady: false,
    });

    res.status(201).json({
      success: true,
      message: 'Joined room successfully',
      data: {
        participant: newParticipant,
        room
      }
    });

  } catch (error) {
    console.error('Join Room Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid room ID format' 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error: ' + error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Server error while joining room',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getRoomsByGameId = [
  protect,
  async (req, res) => {
    try {
      const rooms = await MultiplayerRoom.find({ gameId: req.params.gameId })
        .populate('qrCode')
        .populate('participants')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid game ID'
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
