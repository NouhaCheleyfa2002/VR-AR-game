// routes/level.routes.js
import express from 'express';
const levelRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllLevels,
  getLevelById,
  getLevelsByScenarioId,
  createLevel,
  updateLevel,
  deleteLevel
} from '../controllers/Level.js';

// GET /api/levels
levelRouter.get('/', getAllLevels);

// GET /api/levels/:id
levelRouter.get('/:id', getLevelById);

// GET /api/levels/scenario/:scenarioId
levelRouter.get('/scenario/:scenarioId', getLevelsByScenarioId);

// POST /api/levels
levelRouter.post('/', protect, authorize('admin'), createLevel);

// PUT /api/levels/:id
levelRouter.put('/:id', protect, authorize('admin'), updateLevel);

// DELETE /api/levels/:id
levelRouter.delete('/:id', protect, authorize('admin'), deleteLevel);

export default levelRouter;
