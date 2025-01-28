// routes/kyc.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { handleUpload } from '../middleware/upload.middleware';
import {
  submitKYC,
  getKYCStatus,
  getAllKYCs,
  updateKYCStatus,
  getKYCStatistics,
  getDocument
} from '../controllers/kyc.controller';

const router = Router();

// User routes
router.post('/submit', authenticateToken, handleUpload, submitKYC);
router.get('/status', authenticateToken, getKYCStatus);
router.get('/document/:id', authenticateToken, getDocument);

// Admin routes
router.get('/all', authenticateToken, getAllKYCs);
router.put('/:id/status', authenticateToken, updateKYCStatus);
router.get('/statistics', authenticateToken, getKYCStatistics);

export default router;