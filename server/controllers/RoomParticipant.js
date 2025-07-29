import RoomParticipant from '../models/RoomParticipant.js';
import MultiplayerRoom from '../models/MultiplayerRoom.js';
import { protect, authorize } from '../middleware/auth.js';



//toggling ready status
export const toggleParticipantReady = [
  protect,
  async (req, res) => {
    try {
      const participantId = req.params.id;

      // Find the participant
      let participant = await RoomParticipant.findById(participantId)
        .populate('roomId')
        .populate('playerId');

      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }

      // Check if the room is still active
      if (!participant.roomId.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update ready status - room is not active'
        });
      }

      // Check if the room is closed
      if (participant.roomId.roomStatus === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update ready status - room is closed'
        });
      }

      // Toggle the ready status
      const newReadyStatus = !participant.isReady;

      // Update the participant
      participant = await RoomParticipant.findByIdAndUpdate(
        participantId,
        { 
          isReady: newReadyStatus,
          // Update the timestamp when ready status changes
          lastUpdated: new Date()
        },
        {
          new: true,
          runValidators: true
        }
      )
        .populate('roomId')
        .populate('playerId');

      // Optional: Check if all participants are ready and update room status
      const allParticipants = await RoomParticipant.find({ 
        roomId: participant.roomId._id 
      });
      
      const allReady = allParticipants.length > 0 && 
        allParticipants.every(p => p.isReady);

      // Update room status if needed
      if (allReady && participant.roomId.roomStatus === 'waiting') {
        await MultiplayerRoom.findByIdAndUpdate(
          participant.roomId._id,
          { roomStatus: 'ready' }
        );
      } else if (!allReady && participant.roomId.roomStatus === 'ready') {
        await MultiplayerRoom.findByIdAndUpdate(
          participant.roomId._id,
          { roomStatus: 'waiting' }
        );
      }

      res.status(200).json({
        success: true,
        data: participant,
        message: `Participant marked as ${newReadyStatus ? 'ready' : 'not ready'}`,
        allParticipantsReady: allReady
      });

    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }

      console.error('Toggle ready status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating ready status',
        error: error.message
      });
    }
  }
];

// bulk ready status updates (useful for host actions)
export const updateParticipantReadyStatus = [
  protect,
  async (req, res) => {
    try {
      const participantId = req.params.id;
      const { isReady } = req.body;

      if (typeof isReady !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isReady must be a boolean value'
        });
      }

      let participant = await RoomParticipant.findById(participantId)
        .populate('roomId')
        .populate('playerId');

      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }

      // Check room status
      if (!participant.roomId.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update ready status - room is not active'
        });
      }

      // Update the participant
      participant = await RoomParticipant.findByIdAndUpdate(
        participantId,
        { 
          isReady,
          lastUpdated: new Date()
        },
        {
          new: true,
          runValidators: true
        }
      )
        .populate('roomId')
        .populate('playerId');

      res.status(200).json({
        success: true,
        data: participant,
        message: `Participant ready status updated to ${isReady}`
      });

    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while updating ready status',
        error: error.message
      });
    }
  }
];

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

      if (!roomId || !playerId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide roomId and playerId'
        });
      }

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

      await MultiplayerRoom.findByIdAndUpdate(
        roomId,
        { $push: { participants: participant._id } },
        { new: true }
      );

      const populatedParticipant = await RoomParticipant.findById(participant._id)
        .populate('roomId')
        .populate('playerId');

      res.status(201).json({
        success: true,
        data: populatedParticipant
      });
    } catch (error) {
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
      if (error.name === 'CastError') {
        return res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }

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

      await MultiplayerRoom.findByIdAndUpdate(
        participant.roomId,
        { $pull: { participants: participant._id } },
        { new: true }
      );

      await RoomParticipant.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Participant removed successfully'
      });
    } catch (error) {
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