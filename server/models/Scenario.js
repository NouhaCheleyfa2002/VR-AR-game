// models/Scenario.js
import mongoose from 'mongoose';

const scenarioSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EscapeGame',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  levels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level'
    }
  ],

}, {
  timestamps: true
});

export default mongoose.model('Scenario', scenarioSchema);
