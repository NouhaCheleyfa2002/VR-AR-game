// models/Scene.js
import mongoose from 'mongoose';

const sceneSchema = new mongoose.Schema({
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  media: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }
  ],
  interactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interaction'
    }
  ],
  sceneType: {
    type: String,
    enum: ['2D', 'VR', 'AR'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Scene', sceneSchema);
