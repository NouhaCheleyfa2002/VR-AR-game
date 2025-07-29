// routes/multiplayerRoom.routes.js
import express from 'express';
const roomRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllRooms,
  getRoomById,
  joinRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByGameId,
  getRoomByCode,
  joinRoomByCode
} from '../controllers/MultiplayerRoom.js';

// GET /api/rooms
roomRouter.get('/', getAllRooms);

// GET /api/rooms/:id
roomRouter.get('/:id', getRoomById);

roomRouter.get('/games/:gameId', getRoomsByGameId);

roomRouter.get('/code/:code',protect, getRoomByCode);
roomRouter.post('/code/:code/join', joinRoomByCode);

roomRouter.post('/:id/join', protect, joinRoom);

// POST /api/rooms
roomRouter.post('/', createRoom);

// PUT /api/rooms/:id
roomRouter.put('/:id', updateRoom);

// DELETE /api/rooms/:id
roomRouter.delete('/:id',deleteRoom);

export default roomRouter;
