// models/EscapeGame.js
import mongoose from 'mongoose';

const escapeGameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  theme: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  culturalContext: {
    type: String
  },
  scenarios: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scenario'
    }
  ],
 
}, {
  timestamps: true
});

export default mongoose.model('EscapeGame', escapeGameSchema);
