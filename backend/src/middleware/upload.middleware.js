import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Determine writable upload directory (serverless environments like Vercel have read-only task root)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
export const baseUploadDir = isServerless ? path.join(os.tmpdir(), 'uthan_uploads') : process.cwd();

// Ensure upload directories exist safely without crashing read-only lambdas
const uploadDirs = ['', 'uploads', 'uploads/products', 'uploads/payments', 'uploads/avatars'];
uploadDirs.forEach((dir) => {
  try {
    const fullPath = path.resolve(baseUploadDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  } catch (err) {
    console.warn(`[UPLOAD] Non-fatal notice: upload directory ${dir} cannot be created:`, err.message);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/products';
    if (req.baseUrl.includes('payment') || req.body.type === 'payment') {
      dest = 'uploads/payments';
    }
    const fullPath = path.resolve(baseUploadDir, dest);
    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    } catch {
      // Ignored
    }
    cb(null, fullPath);
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
