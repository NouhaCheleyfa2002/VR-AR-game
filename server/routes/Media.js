// routes/media.routes.js
import express from 'express';
const mediaRouter = express.Router();

import {
  getAllMedia,
  getMediaById,
  uploadMedia,
  deleteMedia
} from '../controllers/Media';

// GET /api/media
mediaRouter.get('/', getAllMedia);

// GET /api/media/:id
mediaRouter.get('/:id', getMediaById);

// POST /api/media
mediaRouter.post('/', uploadMedia);

// DELETE /api/media/:id
mediaRouter.delete('/:id', deleteMedia);

export default mediaRouter;
