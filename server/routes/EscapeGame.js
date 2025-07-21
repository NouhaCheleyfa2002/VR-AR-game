import express from 'express';
const GameRouter = express.Router();

import { protect, authorize } from '../middleware/auth.js';
import {
  getAllEscapeGames,
  getEscapeGameById,
  createEscapeGame,
  updateEscapeGame,
  deleteEscapeGame,
  toggleEscapeGameActive 
} from '../controllers/EscapeGame.js';

// GET /api/escape-games
GameRouter.get('/', getAllEscapeGames);

GameRouter.get('/:id', getEscapeGameById);

// POST /api/escape-games
GameRouter.post('/', createEscapeGame);

// PUT /api/escape-games/:id
GameRouter.put('/:id', updateEscapeGame);

// DELETE /api/escape-games/:id
GameRouter.delete('/:id',  deleteEscapeGame);

GameRouter.patch('/:id/toggle-active', toggleEscapeGameActive);

export default GameRouter;
