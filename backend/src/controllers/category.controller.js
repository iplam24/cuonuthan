import { dbPool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getCategories(req, res) {
  try {
    const [rows] = await dbPool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);
    return sendSuccess(res, rows, 'Lấy danh mục thành công');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function getAllCategoriesAdmin(req, res) {
  try {
    const [rows] = await dbPool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);
    return sendSuccess(res, rows, 'Lấy toàn bộ danh mục cho Admin thành công');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function createCategory(req, res) {
  try {
    const { name, slug, description, image_url, sort_order } = req.body;
    if (!name) {
      return sendError(res, 'Tên danh mục không được để trống!', [], 400);
    }
    const finalSlug = slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [result] = await dbPool.query(
      `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [name, finalSlug, description || null, image_url || null, sort_order || 0]
    );

    return sendSuccess(res, { id: result.insertId, name, slug: finalSlug }, 'Tạo danh mục mới thành công!', 201);
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, description, image_url, sort_order, is_active } = req.body;

    await dbPool.query(
      `UPDATE categories
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           image_url = COALESCE(?, image_url),
           sort_order = COALESCE(?, sort_order),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, slug, description, image_url, sort_order, is_active, id]
    );

    return sendSuccess(res, { id, updated: true }, 'Cập nhật danh mục thành công!');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    await dbPool.query('DELETE FROM categories WHERE id = ?', [id]);
    return sendSuccess(res, { id, deleted: true }, 'Xóa danh mục thành công!');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}
