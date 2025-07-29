import MultiplayerRoom from '../models/MultiplayerRoom.js';
import { protect, authorize } from '../middleware/auth.js';
import RoomParticipant from'../models/RoomParticipant.js';


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

export const getRoomsByGameId = [
  protect,
  async (req, res) => {
    try {
      // Split the gameId parameter by comma and filter out empty strings
      const gameIds = req.params.gameId
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      
      // Validate that we have at least one valid game ID
      if (gameIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one valid game ID is required'
        });
      }

      const rooms = await MultiplayerRoom.find({
        gameId: { $elemMatch: { $in: gameIds } }
      })
      .populate('qrCode')
      .populate('participants')
      .sort({ createdAt: -1 });

      console.log('Found rooms:', rooms.length);

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms,
      });

    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid game ID format'
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

// Add this controller to your room controller file

export const getRoomByCode = [
  protect,
  async (req, res) => {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Access code is required'
        });
      }

      // Find room by accessCode field (note the capital C)
      const room = await MultiplayerRoom.findOne({ accessCode: code })
        .populate('qrCode')
        .populate('participants');

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found with this access code'
        });
      }

      // Check if room is still available for joining
      if (!room.isActive || room.roomStatus === 'closed') {
        return res.status(403).json({
          success: false,
          message: 'Room is no longer available'
        });
      }

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error fetching room by code:', error);
      
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];
 
export const joinRoomByCode = [
  protect,
  async (req, res) => {
    const { code } = req.params;
    const playerId = req.user?.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Access code is required'
      });
    }

    if (!playerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required - Player ID not found'
      });
    }

    try {
      // Find room by access code (note the capital C)
      const room = await MultiplayerRoom.findOne({ accessCode: code });
      
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found with this access code'
        });
      }

      if (!room.isActive || room.roomStatus === 'closed') {
        return res.status(403).json({
          success: false,
          error: 'Room is not accepting new players'
        });
      }

      const participantsCount = await RoomParticipant.countDocuments({ roomId: room._id });
      const maxPlayers = room.maxPlayers || 6;

      if (participantsCount >= maxPlayers) {
        return res.status(403).json({
          success: false,
          error: 'Room is full'
        });
      }

      const existingParticipant = await RoomParticipant.findOne({ 
        roomId: room._id, 
        playerId 
      });
      
      if (existingParticipant) {
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
        roomId: room._id,
        playerId,
        joinedAt: new Date(),
        isHost: participantsCount === 0,
        isReady: false,
        gameId: room.gameId || []
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
      console.error('Join Room By Code Error:', error);

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
  }
];

// join room
export const joinRoom = async (req, res) => {
  const { id: roomId } = req.params;
  const playerId = req.user?.id; 
  
  
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
      gameId: gameId || [] 
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

export const createRoom = [
  protect,
  async (req, res) => {
    try {
      const { qrCode, accessCode, participants, roomStatus, startGame ,gameId, maxPlayers} = req.body;

      // Validate required fields
      if (!qrCode || !accesscode) {
        return res.status(400).json({
          success: false,
          message: 'Please provide qrCode and accesscode'
        });
      }

      // Check if accesscode already exists
      const existingRoom = await MultiplayerRoom.findOne({ accessCode });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Access code already exists'
        });
      }

      const roomData = {
        qrCode,
        accessCode,
        participants: participants || [],
        roomStatus: roomStatus || 'open',
        startGame: startGame || false,
        gameId: gameId || [],
        maxPlayers: maxPlayers || 4
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
      const { qrCode, accessCode, participants, roomStatus, startGame, isActive, gameId, maxPlayers } = req.body;

      let room = await MultiplayerRoom.findById(req.params.id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Check if new accesscode conflicts with existing ones (if accesscode is being updated)
      if (accessCode && accessCode !== room.accesscode) {
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
      if (accessCode !== undefined) updateData.accessCode = accessCode;
      if (participants !== undefined) updateData.participants = participants;
      if (roomStatus !== undefined) updateData.roomStatus = roomStatus;
      if (startGame !== undefined) updateData.startGame = startGame;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (gameId !== undefined) updateData.gameId = gameId; 
      if (maxPlayers !== undefined) updateData.maxPlayers= maxPlayers; 

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
