import express from 'express';
const feedbackRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllFeedbacks,
  getFeedbackById,
  getFeedbacksByPlayer,
  createFeedback,
  updateFeedback,
  deleteFeedback
} from '../controllers/Feedback.js';

feedbackRouter.get('/', getAllFeedbacks);

feedbackRouter.get('/:id', protect,authorize('admin'), getFeedbackById);

feedbackRouter.get('/player/:playerId',protect,authorize('admin'),  getFeedbacksByPlayer);

feedbackRouter.post('/', createFeedback);

feedbackRouter.put('/:id', updateFeedback);

feedbackRouter.delete('/:id', deleteFeedback);

export default feedbackRouter;
