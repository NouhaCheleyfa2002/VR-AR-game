// routes/gameplaySession.routes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
const sessionRouter = express.Router();

import {
  getAllSessions,
  getSessionById,
  getSessionsByPlayerId,
  getSessionsByRoomId,
  createSession,
  updateSession,
  deleteSession
} from '../controllers/GameplaySession.js';


sessionRouter.get('/', protect, authorize('admin'), getAllSessions);

// Admin can view any session, players can only view their own
sessionRouter.get('/:id', protect, getSessionById);

sessionRouter.get('/player/:playerId', protect, getSessionsByPlayerId);

sessionRouter.get('/room/:roomId', protect, getSessionsByRoomId);

//Players can create their own sessions(initialy)
sessionRouter.post('/', protect, createSession);

// admins can update any
sessionRouter.put('/:id', protect,authorize('admin'), updateSession);

// Admin can delete any session
sessionRouter.delete('/:id', protect,authorize('admin'), deleteSession);

export default sessionRouter;