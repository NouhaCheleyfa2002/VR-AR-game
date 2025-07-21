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
scenarioRouter.post('/', createScenario);

// PUT /api/scenarios/:id
scenarioRouter.put('/:id', updateScenario);

// DELETE /api/scenarios/:id
scenarioRouter.delete('/:id', deleteScenario);

export default scenarioRouter;
