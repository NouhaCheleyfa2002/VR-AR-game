// routes/multiplayerRoom.routes.js
import express from 'express';
const roomRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllRooms,
  getRoomById,
  getRoomByCode,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/MultiplayerRoom.js';

// GET /api/rooms
roomRouter.get('/',protect,authorize('admin'), getAllRooms);

// GET /api/rooms/:id
roomRouter.get('/:id',protect,authorize('admin'), getRoomById);

// GET /api/rooms/code/:code
roomRouter.get('/code/:code',protect,authorize('admin'), getRoomByCode);

// POST /api/rooms
roomRouter.post('/',protect,authorize('admin'), createRoom);

// PUT /api/rooms/:id
roomRouter.put('/:id',protect,authorize('admin'), updateRoom);

// DELETE /api/rooms/:id
roomRouter.delete('/:id',protect,authorize('admin'), deleteRoom);

export default roomRouter;
