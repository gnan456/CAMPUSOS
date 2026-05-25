import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage as cloudinaryStorage } from '@/config/cloudinary';
import { ApiError } from '@/utils/ApiError';
import { env } from '@/config/env';

// Determine if we should use local storage fallback
const isPlaceholderCloudinary = 
  !env.CLOUDINARY_CLOUD_NAME || 
  env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name' || 
  env.CLOUDINARY_CLOUD_NAME.startsWith('your');

let storage: multer.StorageEngine;

if (isPlaceholderCloudinary) {
  // Ensure public/uploads directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
} else {
  storage = cloudinaryStorage;
}

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max size
  },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.match(/\.(pdf|doc|docx|jpg|jpeg|png)$/i)) {
      return cb(new ApiError(400, 'Only PDF, DOC, and Image files are allowed'));
    }
    cb(null, true);
  },
});

// Middleware wrapper to convert disk path to public web URL
export const upload = {
  single: (fieldName: string) => {
    return (req: any, res: any, next: any) => {
      multerUpload.single(fieldName)(req, res, (err) => {
        if (err) {
          return next(err);
        }
        if (req.file && isPlaceholderCloudinary) {
          // Convert absolute path to local server URL
          req.file.path = `http://localhost:5000/uploads/${req.file.filename}`;
        }
        next();
      });
    };
  }
};
