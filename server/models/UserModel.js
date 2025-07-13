// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'player'],
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  gameplayHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameplaySession'
    }
  ]
}, {
  timestamps: true // adds createdAt and updatedAt fields
});

export default mongoose.model('User', userSchema);
