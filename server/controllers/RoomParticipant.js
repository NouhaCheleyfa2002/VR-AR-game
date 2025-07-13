import RoomParticipant from '../models/RoomParticipant.js';
import MultiplayerRoom from '../models/MultiplayerRoom.js';
import { protect, authorize } from '../middleware/auth.js';


export const getAllParticipants = [
  protect,
  async (req, res) => {
    try {
      const participants = await RoomParticipant.find()
        .populate('roomId')
        .populate('playerId')
        .sort({ joinedAt: -1 });

      res.status(200).json({
        success: true,
        count: participants.length,
        data: participants
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

export const getParticipantById = [
  protect,
  async (req, res) => {
    try {
      const participant = await RoomParticipant.findById(req.params.id)
        .populate('roomId')
        .populate('playerId');

      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }

      res.status(200).json({
        success: true,
        data: participant
      });
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
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

export const getParticipantsByRoomId = [
  protect,
  async (req, res) => {
    try {
      const participants = await RoomParticipant.find({ roomId: req.params.roomId })
        .populate('roomId')
        .populate('playerId')
        .sort({ joinedAt: 1 });

      res.status(200).json({
        success: true,
        count: participants.length,
        data: participants
      });
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Invalid room ID'
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

export const getParticipantsByPlayerId = [
  protect,
  async (req, res) => {
    try {
      const participants = await RoomParticipant.find({ playerId: req.params.playerId })
        .populate('roomId')
        .populate('playerId')
        .sort({ joinedAt: -1 });

      res.status(200).json({
        success: true,
        count: participants.length,
        data: participants
      });
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Invalid player ID'
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

export const createParticipant = [
  protect,
  async (req, res) => {
    try {
      const { roomId, playerId, isReady, syncProgress } = req.body;

      // Validate required fields
      if (!roomId || !playerId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide roomId and playerId'
        });
      }

      // Check if room exists and is active
      const room = await MultiplayerRoom.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      if (!room.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Room is not active'
        });
      }

      if (room.roomStatus === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Room is closed for new participants'
        });
      }

      // Check if player is already in the room
      const existingParticipant = await RoomParticipant.findOne({
        roomId,
        playerId
      });

      if (existingParticipant) {
        return res.status(400).json({
          success: false,
          message: 'Player is already in this room'
        });
      }

      const participantData = {
        roomId,
        playerId,
        isReady: isReady || false,
        syncProgress: syncProgress || false
      };

      const participant = await RoomParticipant.create(participantData);

      // Add participant to room's participants array
      await MultiplayerRoom.findByIdAndUpdate(
        roomId,
        { $push: { participants: participant._id } },
        { new: true }
      );

      // Populate the created participant
      const populatedParticipant = await RoomParticipant.findById(participant._id)
        .populate('roomId')
        .populate('playerId');

      res.status(201).json({
        success: true,
        data: populatedParticipant
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

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

export const updateParticipant = [
  protect,
  async (req, res) => {
    try {
      const { isReady, syncProgress } = req.body;

      let participant = await RoomParticipant.findById(req.params.id);

      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }

      // Update fields
      const updateData = {};
      if (isReady !== undefined) updateData.isReady = isReady;
      if (syncProgress !== undefined) updateData.syncProgress = syncProgress;

      participant = await RoomParticipant.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true
        }
      )
        .populate('roomId')
        .populate('playerId');

      res.status(200).json({
        success: true,
        data: participant
      });
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
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

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

export const deleteParticipant = [
  protect,
  async (req, res) => {
    try {
      const participant = await RoomParticipant.findById(req.params.id);

      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }

      // Remove participant from room's participants array
      await MultiplayerRoom.findByIdAndUpdate(
        participant.roomId,
        { $pull: { participants: participant._id } },
        { new: true }
      );

      // Delete the participant
      await RoomParticipant.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Participant removed successfully'
      });
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
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