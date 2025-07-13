// routes/puzzle.routes.js
import express from 'express';
const puzzleRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllPuzzles,
  getPuzzleById,
  getPuzzlesByLevelId,
  createPuzzle,
  updatePuzzle,
  deletePuzzle
} from '../controllers/Puzzle.js';

// GET /api/puzzles
puzzleRouter.get('/', getAllPuzzles);

// GET /api/puzzles/:id
puzzleRouter.get('/:id', getPuzzleById);

// GET /api/puzzles/level/:levelId
puzzleRouter.get('/level/:levelId', getPuzzlesByLevelId);

// POST /api/puzzles
puzzleRouter.post('/',protect, authorize('admin'), createPuzzle);

// PUT /api/puzzles/:id
puzzleRouter.put('/:id',protect, authorize('admin'), updatePuzzle);

// DELETE /api/puzzles/:id
puzzleRouter.delete('/:id',protect, authorize('admin'), deletePuzzle);

export default puzzleRouter;
