import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import { UPLOAD_DIR } from './config/upload.config';
import authRoutes from './routes/auth.routes';
import kycRoutes from './routes/kyc.routes';

dotenv.config();

// Ensure uploads directory exists at root level
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

// Serve uploads directory
app.use('/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${UPLOAD_DIR}`);
});