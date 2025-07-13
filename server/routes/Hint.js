// routes/hint.routes.js
import express from 'express';
const hintRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllHints,
  getHintById,
  getHintsByPuzzleId,
  createHint,
  updateHint,
  deleteHint
} from '../controllers/Hints.js';

// GET /api/hints
hintRouter.get('/', getAllHints);

// GET /api/hints/:id
hintRouter.get('/:id', getHintById);

// GET /api/hints/puzzle/:puzzleId
hintRouter.get('/puzzle/:puzzleId', getHintsByPuzzleId);

// POST /api/hints
hintRouter.post('/', protect, authorize('admin'), createHint);

// PUT /api/hints/:id
hintRouter.put('/:id', protect, authorize('admin'), updateHint);

// DELETE /api/hints/:id
hintRouter.delete('/:id', protect, authorize('admin'), deleteHint);

export default hintRouter;
