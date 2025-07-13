//changes needs to be done after integrating AI
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameplaySession',
    required: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['bug', 'feedback', 'abuse', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);
