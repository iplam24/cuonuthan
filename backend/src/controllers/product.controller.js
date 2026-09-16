import db from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { resolveProductPrice } from '../utils/pricing.js';

// Get list of products with filters, search, pagination
export const getProducts = async (req, res, next) => {
  try {
    const {
      category_id,
      category_slug,
      is_featured,
      is_active,
      is_out_of_stock,
      search,
      min_price,
      max_price,
      sort = 'sort_order_asc',
      page = 1,
      limit = 50,
    } = req.query;

    // Tự động làm mới hạn mức suất ăn trong ngày nếu bước sang ngày mới
    await db.query(`
      UPDATE products
      SET current_stock = daily_stock, stock_reset_date = CURRENT_DATE()
      WHERE daily_stock IS NOT NULL AND (stock_reset_date IS NULL OR stock_reset_date < CURRENT_DATE())
    `);

    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.deleted_at IS NULL OR ? = 'all')
    `;
    const params = [is_active === 'all' ? 'all' : 'active'];

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(Number(category_id));
    }

    if (category_slug) {
      query += ` AND c.slug = ?`;
      params.push(category_slug);
    }

    if (is_featured !== undefined) {
      query += ` AND p.is_featured = ?`;
      params.push(Number(is_featured));
    }

    if (is_out_of_stock !== undefined) {
      const wantOutOfStock = Number(is_out_of_stock) === 1;
      query += ` AND p.is_available = ?`;
      params.push(wantOutOfStock ? 0 : 1);
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (min_price !== undefined && !isNaN(Number(min_price))) {
      query += ` AND COALESCE(NULLIF(p.sale_price, 0), p.price) >= ?`;
      params.push(Number(min_price));
    }

    if (max_price !== undefined && !isNaN(Number(max_price))) {
      query += ` AND COALESCE(NULLIF(p.sale_price, 0), p.price) <= ?`;
      params.push(Number(max_price));
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'name_asc':
        query += ` ORDER BY p.name ASC`;
        break;
      case 'newest':
        query += ` ORDER BY p.created_at DESC`;
        break;
      case 'sort_order_asc':
      default:
        query += ` ORDER BY p.sort_order ASC, p.id ASC`;
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const countSql = `SELECT COUNT(*) as total FROM (${query}) as count_table`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    query += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const [products] = await db.query(query, params);

    // Fetch images for these products
    if (products.length > 0) {
      const productIds = products.map((p) => p.id);
      const [images] = await db.query(
        `SELECT * FROM product_images WHERE product_id IN (?) ORDER BY is_primary DESC, sort_order ASC`,
        [productIds]
      );

      const imagesByProduct = images.reduce((acc, img) => {
        if (!acc[img.product_id]) acc[img.product_id] = [];
        acc[img.product_id].push(img);
        return acc;
      }, {});

      products.forEach((prod) => {
        prod.images = imagesByProduct[prod.id] || [];
        prod.primary_image = prod.images.length > 0 ? prod.images[0].image_url : '';
        prod.is_out_of_stock = (prod.is_available === 0 || (prod.daily_stock != null && prod.current_stock != null && prod.current_stock <= 0)) ? 1 : 0;
        prod.is_active = prod.deleted_at ? 0 : 1;
        const pricing = resolveProductPrice(prod);
        prod.current_price = pricing.current_price;
        prod.original_price = pricing.original_price;
        prod.is_side_dish = prod.is_side_dish ? 1 : 0;
      });
    }

    return sendSuccess(res, {
      items: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get product by ID or Slug
export const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'}
      LIMIT 1
    `;
    const [products] = await db.query(query, [isNumeric ? Number(idOrSlug) : idOrSlug]);

    if (products.length === 0) {
      return sendError(res, 'Không tìm thấy món ăn', 404);
    }

    const product = products[0];

    // Fetch extra images
    const [images] = await db.query(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC`,
      [product.id]
    );
    product.images = images;
    product.primary_image = images.length > 0 ? images[0].image_url : '';
    product.is_out_of_stock = (product.is_available === 0 || (product.daily_stock != null && product.current_stock != null && product.current_stock <= 0)) ? 1 : 0;
    product.is_active = product.deleted_at ? 0 : 1;
    const pricing = resolveProductPrice(product);
    product.current_price = pricing.current_price;
    product.original_price = pricing.original_price;
    product.is_side_dish = product.is_side_dish ? 1 : 0;

    return sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
};

// Admin: Create product
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      category_id,
      price,
      original_price = null,
      unit = 'phần',
      description = '',
      primary_image = '',
      is_featured = 0,
      is_out_of_stock = 0,
      is_side_dish = 0,
      sort_order = 0,
    } = req.body;

    if (!name || !price || !category_id) {
      return sendError(res, 'Vui lòng cung cấp đầy đủ: Tên món, Giá và Danh mục!', 400);
    }

    const productSlug =
      slug ||
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const [result] = await db.query(
      `INSERT INTO products (
        category_id, name, slug, price, sale_price, description, unit,
        is_available, is_featured, is_side_dish, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        productSlug,
        price,
        original_price,
        description,
        unit,
        is_out_of_stock ? 0 : 1,
        is_featured ? 1 : 0,
        is_side_dish ? 1 : 0,
        sort_order,
      ]
    );

    const productId = result.insertId;

    if (primary_image) {
      await db.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, 1, 0)`,
        [productId, primary_image]
      );
    }

    return sendSuccess(res, { id: productId, message: 'Thêm món ăn thành công!' }, 201);
  } catch (err) {
    next(err);
  }
};

// Admin: Update product
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      category_id,
      price,
      original_price,
      unit,
      description,
      primary_image,
      is_featured,
      is_out_of_stock,
      is_side_dish,
      sort_order,
    } = req.body;

    const [existing] = await db.query(`SELECT id FROM products WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return sendError(res, 'Món ăn không tồn tại', 404);
    }

    await db.query(
      `UPDATE products SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        category_id = COALESCE(?, category_id),
        price = COALESCE(?, price),
        sale_price = COALESCE(?, sale_price),
        unit = COALESCE(?, unit),
        description = COALESCE(?, description),
        is_available = COALESCE(?, is_available),
        is_featured = COALESCE(?, is_featured),
        is_side_dish = COALESCE(?, is_side_dish),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?`,
      [
        name,
        slug,
        category_id,
        price,
        original_price,
        unit,
        description,
        is_out_of_stock !== undefined ? (is_out_of_stock ? 0 : 1) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_side_dish !== undefined ? (is_side_dish ? 1 : 0) : null,
        sort_order,
        id,
      ]
    );

    if (primary_image) {
      const [imgCheck] = await db.query(`SELECT id FROM product_images WHERE product_id = ? LIMIT 1`, [id]);
      if (imgCheck.length > 0) {
        await db.query(`UPDATE product_images SET image_url = ? WHERE id = ?`, [primary_image, imgCheck[0].id]);
      } else {
        await db.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, 1, 0)`,
          [id, primary_image]
        );
      }
    }

    return sendSuccess(res, { id, message: 'Cập nhật món ăn thành công!' });
  } catch (err) {
    next(err);
  }
};

// Quick toggle: is_out_of_stock or is_active
export const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { field } = req.body; // 'is_out_of_stock' or 'is_active' or 'is_featured'

    const [rows] = await db.query(`SELECT id, is_available, is_featured, deleted_at FROM products WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return sendError(res, 'Không tìm thấy món ăn', 404);
    }
    const prod = rows[0];

    if (field === 'is_out_of_stock') {
      const newAvailable = prod.is_available === 1 ? 0 : 1;
      await db.query(`UPDATE products SET is_available = ? WHERE id = ?`, [newAvailable, id]);
      return sendSuccess(res, {
        id,
        field,
        value: newAvailable === 0 ? 1 : 0,
        message: `Đã đổi trạng thái kho sang: ${newAvailable === 0 ? 'Hết hàng' : 'Còn hàng'}`,
      });
    }

    if (field === 'is_active') {
      const newDeleted = prod.deleted_at ? null : new Date();
      await db.query(`UPDATE products SET deleted_at = ? WHERE id = ?`, [newDeleted, id]);
      return sendSuccess(res, {
        id,
        field,
        value: newDeleted ? 0 : 1,
        message: `Đã đổi hiển thị món: ${newDeleted ? 'Ẩn món' : 'Đang bán'}`,
      });
    }

    if (field === 'is_featured') {
      const newFeatured = prod.is_featured === 1 ? 0 : 1;
      await db.query(`UPDATE products SET is_featured = ? WHERE id = ?`, [newFeatured, id]);
      return sendSuccess(res, {
        id,
        field,
        value: newFeatured,
        message: `Đã đổi trạng thái nổi bật`,
      });
    }

    return sendError(res, 'Trường cập nhật không hợp lệ', 400);
  } catch (err) {
    next(err);
  }
};

// Admin: Delete product
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE products SET deleted_at = NOW() WHERE id = ?`, [id]);
    return sendSuccess(res, { message: 'Đã xóa món ăn thành công!' });
  } catch (err) {
    next(err);
  }
};

// Admin / Kitchen: Update daily stock limit and remaining stock
export const updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { daily_stock, current_stock } = req.body;
    const updates = [];
    const values = [];

    if (daily_stock !== undefined) {
      updates.push('daily_stock = ?');
      values.push(daily_stock === null || daily_stock === '' ? null : Math.max(0, parseInt(daily_stock, 10)));
    }

    if (current_stock !== undefined) {
      updates.push('current_stock = ?');
      values.push(current_stock === null || current_stock === '' ? null : Math.max(0, parseInt(current_stock, 10)));
      updates.push('stock_reset_date = CURRENT_DATE()');
    }

    if (updates.length === 0) {
      return sendError(res, 'Không có thông tin tồn kho cần cập nhật!', [], 400);
    }

    values.push(id);
    await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

    return sendSuccess(res, null, 'Cập nhật số suất trong ngày thành công!');
  } catch (err) {
    next(err);
  }
};

export const getProductDetail = getProductByIdOrSlug;
export const toggleStock = toggleProductStatus;

