
import mongoose from 'mongoose';

const invitationBaseSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // can be null when only email is available
  },
  receiverEmail: {
    type: String,
    required: true
  },
  invitationStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  discriminatorKey: 'type',//We use discriminators to derive the Partnership model from invitation model
  timestamps: true
});

const Invitation = mongoose.model('Invitation', invitationBaseSchema);

export default Invitation;
