// routes/scenario.routes.js
import express from 'express';
const scenarioRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllScenarios,
  getScenarioById,
  getScenariosByGameId,
  createScenario,
  updateScenario,
  deleteScenario
} from '../controllers/Scenario.js';

// GET /api/scenarios
scenarioRouter.get('/', getAllScenarios);

// GET /api/scenarios/:id
scenarioRouter.get('/:id', getScenarioById);

// GET /api/scenarios/game/:gameId
scenarioRouter.get('/game/:gameId', getScenariosByGameId);

// POST /api/scenarios
scenarioRouter.post('/', protect, authorize('admin'), createScenario);

// PUT /api/scenarios/:id
scenarioRouter.put('/:id', protect, authorize('admin'), updateScenario);

// DELETE /api/scenarios/:id
scenarioRouter.delete('/:id', protect, authorize('admin'), deleteScenario);

export default scenarioRouter;
