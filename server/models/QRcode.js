import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MultiplayerRoom',
    required: false
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EscapeGame',
    required: false
  },
  content: {
    type: String,
    required: true
  },
  associatedRooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MultiplayerRoom'
    }
  ],
  maxScans: {
    type: Number,
    default: 1,
    min: 1
  },
  expirationDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model('QRCode', qrCodeSchema);
