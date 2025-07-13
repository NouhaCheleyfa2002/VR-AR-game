import express from 'express';
const invitationRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllInvitations,
  getInvitationById,
  getInvitationsByStatus,
  getInvitationsBySender,
  createInvitation,
  updateInvitation,
  deleteInvitation
} from '../controllers/Invitation.js';


invitationRouter.get('/', getAllInvitations);

invitationRouter.get('/:id', protect, authorize('admin'), getInvitationById);

invitationRouter.get('/status/:status',getInvitationsByStatus);

invitationRouter.get('/sender/:senderId', getInvitationsBySender);

invitationRouter.post('/', createInvitation);

// PUT /api/invitations/:id
invitationRouter.put('/:id', updateInvitation);

// DELETE /api/invitations/:id
invitationRouter.delete('/:id', deleteInvitation);

export default invitationRouter;
