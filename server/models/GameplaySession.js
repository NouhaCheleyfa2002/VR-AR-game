import mongoose from 'mongoose';

const gameplaySessionSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },

  assignedLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: false // optionally assigned by game logic
  },

  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EscapeGame',
    required: false
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MultiplayerRoom',
    required: false
  },

  startTime: {
    type: Date,
    default: Date.now
  },

  endTime: {
    type: Date
  },

  timeSpent: {
    type: Number, // in minutes or seconds
    default: 0
  },

  totalScore: {
    type: Number,
    default: 0
  },

  hintsUsed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hint'
    }
  ],

  hintUsageRate: {
    type: Number,
    default: 0 // percentage (0 to 1 or 0 to 100 depending on logic)
  },

  culturalKnowledge: {
    type: Number,
    default: 0 // some metric out of 100 or 10
  },

  adaptationScore: {
    type: Number,
    default: 0 // how well the game adapted to the user
  },

  errorRate: {
    type: Number,
    default: 0 // number of errors or percentage
  },

  preferredDifficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: false
  },

  avgSolveTime: {
    type: Number,
    default: 0 // average time in seconds or minutes
  },

  completionRate: {
    type: Number,
    default: 0 // 0 to 1 or percentage
  },

  gameState: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  }

}, {
  timestamps: true
});

export default mongoose.model('GameplaySession', gameplaySessionSchema);
