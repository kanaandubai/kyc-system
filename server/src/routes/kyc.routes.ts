// routes/kyc.routes.ts
import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';
import { upload } from '../config/upload.config';

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
router.post('/submit', authenticateToken, upload.single('document'), submitKYC);
router.get('/status', authenticateToken, getKYCStatus);
router.get('/document/:id', authenticateToken, getDocument);

// Admin routes
router.get('/all', authenticateToken, isAdmin, getAllKYCs);
router.put('/:id/status', authenticateToken, isAdmin, updateKYCStatus);
router.get('/statistics', authenticateToken, isAdmin, getKYCStatistics);

export default router;