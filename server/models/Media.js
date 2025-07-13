// models/Media.js
import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'vr', 'ar'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Media', mediaSchema);
