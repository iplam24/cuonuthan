import fs from 'fs/promises';
import db from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

const fileTypeOf = (mimeType = '') => mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('image/') ? 'image' : 'document';
const userIdOf = (req) => req.user?.userId ?? req.user?.id ?? null;
const cleanup = async (files) => Promise.allSettled(files.map((file) => fs.unlink(file.path)));

async function saveUpload(file, req) {
  const subDir = file.destination.includes('payments') ? 'payments' : file.destination.includes('avatars') ? 'avatars' : 'products';
  const fileUrl = `/uploads/${subDir}/${file.filename}`;
  const [result] = await db.query(
    `INSERT INTO uploads (stored_name, original_name, mime_type, file_type, file_size, file_path, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [file.filename, file.originalname, file.mimetype, fileTypeOf(file.mimetype), file.size, fileUrl, userIdOf(req)]
  );
  return { id: result.insertId, url: fileUrl, filename: file.filename, stored_name: file.filename,
    original_name: file.originalname, mime_type: file.mimetype, file_type: fileTypeOf(file.mimetype), size: file.size };
}

export const handleSingleUpload = async (req, res, next) => {
  if (!req.file) return sendError(res, 'Vui lòng chọn file tải lên', 400);
  try {
    return sendSuccess(res, await saveUpload(req.file, req), 'Tải file lên thành công');
  } catch (err) {
    await cleanup([req.file]);
    next(err);
  }
};

export const handleMultipleUpload = async (req, res, next) => {
  if (!req.files?.length) return sendError(res, 'Vui lòng chọn ít nhất một file', 400);
  const uploaded = [];
  try {
    for (const file of req.files) uploaded.push(await saveUpload(file, req));
    return sendSuccess(res, uploaded, 'Tải nhiều file lên thành công');
  } catch (err) {
    await cleanup(req.files);
    if (uploaded.length) await db.query('DELETE FROM uploads WHERE id IN (?)', [uploaded.map((file) => file.id)]);
    next(err);
  }
};
