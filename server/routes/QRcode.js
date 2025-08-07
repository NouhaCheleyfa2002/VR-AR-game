import express from 'express';
const QRCodeRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllQRCodes,
  getQRCodeById,
  createQRCode,
  updateQRCode,
  deleteQRCode,scanQRCode,
  getQRCodesByRoom,
  getQRCodesByGame
} from '../controllers/QRcode.js';

// GET /api/qrcodes
QRCodeRouter.get('/', getAllQRCodes);

// GET /api/qrcodes/:id
QRCodeRouter.get('/:id',getQRCodeById);


QRCodeRouter.post('/scan',scanQRCode);

QRCodeRouter.get('/room/:roomId', getQRCodesByRoom);

QRCodeRouter.get('/game/:gameId', getQRCodesByGame);

// POST /api/qrcodes
QRCodeRouter.post('/', createQRCode);

// PUT /api/qrcodes/:id
QRCodeRouter.put('/:id',updateQRCode);

// DELETE /api/qrcodes/:id
QRCodeRouter.delete('/:id', deleteQRCode);

export default QRCodeRouter;
