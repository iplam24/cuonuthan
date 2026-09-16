import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/products', 'uploads/payments', 'uploads/avatars'];
uploadDirs.forEach((dir) => {
  const fullPath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/products';
    if (req.baseUrl.includes('payment') || req.body.type === 'payment') {
      dest = 'uploads/payments';
    }
    cb(null, path.resolve(process.cwd(), dest));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const MIME_EXTENSIONS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/webm': ['.webm'],
};

export const fileFilter = (req, file, cb) => {
  const mime = String(file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (Object.prototype.hasOwnProperty.call(MIME_EXTENSIONS, mime) && MIME_EXTENSIONS[mime].includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP, GIF, MP4, MOV hoặc WebM.'));
};

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
}).single('file');

export const uploadMultiple = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter,
}).array('files', 10);
