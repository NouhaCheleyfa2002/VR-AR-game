// models/Puzzle.js
import mongoose from 'mongoose';

const puzzleSchema = new mongoose.Schema({
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  question: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  solution: {
    type: String
  },
  scene: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scene'
    }
  ],
  hints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hint'
    }
  ],

}, {
  timestamps: true
});

export default mongoose.model('Puzzle', puzzleSchema);
