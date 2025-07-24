
import mongoose from 'mongoose';

const multiplayerRoomSchema = new mongoose.Schema({
  qrCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EscapeGame',
    required: true
  },
  accesscode: {
    type: String,
    required: true,
    unique: true // For joining via QR or manually
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomParticipant'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  roomStatus: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  startGame: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('MultiplayerRoom', multiplayerRoomSchema);
