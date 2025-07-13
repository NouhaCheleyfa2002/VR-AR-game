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
  deleteParticipant
} from '../controllers/RoomParticipant.js';

// GET /api/participants
participantRouter.get('/',protect,authorize('admin'), getAllParticipants);

// GET /api/participants/:id
participantRouter.get('/:id',protect,authorize('admin'), getParticipantById);

// GET /api/participants/room/:roomId
participantRouter.get('/room/:roomId',protect,authorize('admin'), getParticipantsByRoomId);

// GET /api/participants/player/:playerId
participantRouter.get('/player/:playerId',protect,authorize('admin'), getParticipantsByPlayerId);

// POST /api/participants
participantRouter.post('/',protect,authorize('admin'), createParticipant);

// PUT /api/participants/:id
participantRouter.put('/:id',protect,authorize('admin'), updateParticipant);

// DELETE /api/participants/:id
participantRouter.delete('/:id',protect,authorize('admin'), deleteParticipant);

export default participantRouter;
