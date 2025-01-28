import { Router } from 'express';
import { login, logout, refreshToken, getCurrentUser,register } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/register',register);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticateToken, getCurrentUser);

export default router;