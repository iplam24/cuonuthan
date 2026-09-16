import { dbPool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getSettings(req, res) {
  try {
    const [rows] = await dbPool.query('SELECT setting_key, setting_value, group_name FROM settings');
    const settingsMap = {};
    rows.forEach(r => {
      settingsMap[r.setting_key] = r.setting_value;
    });

    return sendSuccess(res, settingsMap, 'Lấy danh sách cấu hình thành công');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function updateSettings(req, res) {
  try {
    const settingsData = req.body; // e.g. { hotline: '...', facebook_url: '...' }
    if (!settingsData || typeof settingsData !== 'object') {
      return sendError(res, 'Dữ liệu cấu hình không hợp lệ!', [], 400);
    }

    const conn = await dbPool.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(settingsData)) {
        await conn.query(
          `INSERT INTO settings (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key, String(value)]
        );
      }
      await conn.commit();

      const [updatedRows] = await conn.query('SELECT setting_key, setting_value FROM settings');
      const updatedMap = Object.fromEntries(updatedRows.map(r => [r.setting_key, r.setting_value]));

      return sendSuccess(res, updatedMap, 'Cập nhật cấu hình quán thành công!');
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}
