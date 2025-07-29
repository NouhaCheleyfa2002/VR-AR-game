// routes/roomParticipant.routes.js
import express from 'express';
const participantRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllParticipants,
  getParticipantById,
  getParticipantsByRoomId,
  getParticipantsByPlayerId,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  toggleParticipantReady,
  updateParticipantReadyStatus
} from '../controllers/RoomParticipant.js';


participantRouter.get('/', protect, getAllParticipants);

participantRouter.get('/:id', protect, getParticipantById);

participantRouter.get('/room/:roomId', protect, getParticipantsByRoomId);

participantRouter.get('/player/:playerId', protect, getParticipantsByPlayerId);

participantRouter.post('/', protect, createParticipant);

participantRouter.put('/:id', protect, updateParticipant);

participantRouter.patch('/:id/toggle-ready', protect, toggleParticipantReady);

participantRouter.patch('/:id/ready-status', protect, updateParticipantReadyStatus);

participantRouter.delete('/:id', protect, deleteParticipant);

export default participantRouter;