// routes/scene.routes.js
import express from 'express';
const sceneRouter = express.Router();

import {
  getAllScenes,
  getSceneById,
  getScenesByLevelId,
  createScene,
  updateScene,
  deleteScene
} from '../controllers/Scene.js';

// GET /api/scenes
sceneRouter.get('/', getAllScenes);

// GET /api/scenes/:id
sceneRouter.get('/:id', getSceneById);

// GET /api/scenes/level/:levelId
sceneRouter.get('/level/:levelId', getScenesByLevelId);

// POST /api/scenes
sceneRouter.post('/', createScene);

// PUT /api/scenes/:id
sceneRouter.put('/:id', updateScene);

// DELETE /api/scenes/:id
sceneRouter.delete('/:id', deleteScene);

export default sceneRouter;
