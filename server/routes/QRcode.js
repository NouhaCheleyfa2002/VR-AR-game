import express from 'express';
const QRCodeRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllQRCodes,
  getQRCodeById,
  createQRCode,
  updateQRCode,
  deleteQRCode
} from '../controllers/QRcode.js';

// GET /api/qrcodes
QRCodeRouter.get('/', getAllQRCodes);

// GET /api/qrcodes/:id
QRCodeRouter.get('/:id',protect, authorize('admin'),  getQRCodeById);

// POST /api/qrcodes
QRCodeRouter.post('/', protect, authorize('admin'), createQRCode);

// PUT /api/qrcodes/:id
QRCodeRouter.put('/:id', protect, authorize('admin'), updateQRCode);

// DELETE /api/qrcodes/:id
QRCodeRouter.delete('/:id',protect, authorize('admin'),  deleteQRCode);

export default QRCodeRouter;
