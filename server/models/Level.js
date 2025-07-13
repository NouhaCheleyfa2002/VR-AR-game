// models/Level.js
import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  levelNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  timeLimit: {
    type: Number, // in minutes
    default: 0
  },
  puzzle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle'
  },
  scene: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scene'
  },
  reward: {
    type: String
  },
  culturalElement: {
    type: String
  },
  
}, {
  timestamps: true
});

export default mongoose.model('Level', levelSchema);
