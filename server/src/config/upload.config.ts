// config/upload.config.ts
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadConfig = {
  UPLOAD_DIR,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  getDocumentPath: (filename: string) => path.join(UPLOAD_DIR, filename)
};