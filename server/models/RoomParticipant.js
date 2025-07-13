// models/RoomParticipant.js
import mongoose from 'mongoose';

const roomParticipantSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MultiplayerRoom',
    required: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isReady: {
    type: Boolean,
    default: false
  },
  syncProgress: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('RoomParticipant', roomParticipantSchema);
