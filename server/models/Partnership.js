
import Invitation from './Invitation.js';
import mongoose from 'mongoose';

const partnershipSchema = new mongoose.Schema({
  since: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastInteraction: {
    type: Date
  }
});

const Partnership = Invitation.discriminator('Partnership', partnershipSchema);//since partnership inherits from invitation

export default Partnership;
