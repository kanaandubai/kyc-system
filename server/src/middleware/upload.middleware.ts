// middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { uploadConfig } from '../config/upload.config';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate a secure random filename
    crypto.randomBytes(16, (err, raw) => {
      if (err) return cb(err, '');
      
      // Preserve original extension but use random name
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, raw.toString('hex') + ext);
    });
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Validate mime type
  if (!uploadConfig.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPG, PNG and PDF files are allowed.'), false);
  }

  // Validate file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
    return cb(new Error('Invalid file extension'), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: uploadConfig.MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
}).single('document');

// Custom middleware to handle multer errors
export const handleUpload = (req: any, res: any, next: any) => {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File size too large. Maximum size is 5MB'
        });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};