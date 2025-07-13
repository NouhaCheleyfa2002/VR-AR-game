import express from 'express';
const GameRouter = express.Router();

import { protect, authorize } from '../middleware/auth.js';
import {
  getAllEscapeGames,
  getEscapeGameById,
  createEscapeGame,
  updateEscapeGame,
  deleteEscapeGame,
  //getEscapeGamesByTheme,
  //toggleEscapeGameActive 
} from '../controllers/EscapeGame.js';

// GET /api/escape-games
GameRouter.get('/', getAllEscapeGames);

GameRouter.get('/:id', getEscapeGameById);

// POST /api/escape-games
GameRouter.post('/', protect, authorize('admin'), createEscapeGame);

// PUT /api/escape-games/:id
GameRouter.put('/:id', protect, authorize('admin'), updateEscapeGame);

// DELETE /api/escape-games/:id
GameRouter.delete('/:id', protect, authorize('admin'), deleteEscapeGame);

//GameRouter.get('/theme/:theme', getEscapeGamesByTheme);

//GameRouter.patch('/:id/toggle-active', protect, authorize('admin'), toggleEscapeGameActive);

export default GameRouter;
