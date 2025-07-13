// models/Hint.js
import mongoose from 'mongoose';

const hintSchema = new mongoose.Schema({
  puzzleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  hintLevel: {
    type: Number, // 1 = first hint, 2 = second hint, etc.
    required: true
  },
  pointDeducted: {
    type: Number,
    default: 0
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Hint', hintSchema);
