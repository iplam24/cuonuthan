import db from '../config/database.js';
import { ADDRESS_LIMIT, toAddressResponse } from '../utils/addressValidation.js';

async function ensureCustomer(connection, userId) {
  const [rows] = await connection.query(`SELECT id FROM customers WHERE user_id = ? LIMIT 1`, [userId]);
  if (rows.length > 0) return rows[0].id;
  const [userRows] = await connection.query(`SELECT phone, full_name, email FROM users WHERE id = ? LIMIT 1`, [userId]);
  if (!userRows.length) throw new Error('Không tìm thấy người dùng');
  const user = userRows[0];
  const [inserted] = await connection.query(
    `INSERT INTO customers (user_id, phone, full_name, email) VALUES (?, ?, ?, ?)`,
    [userId, user.phone, user.full_name, user.email || null]
  );
  return inserted.insertId;
}

export async function listAddresses(userId) {
  const [rows] = await db.query(
    `SELECT sa.* FROM shipping_addresses sa JOIN customers c ON sa.customer_id = c.id WHERE c.user_id = ? ORDER BY sa.is_default DESC, sa.created_at DESC, sa.id DESC`,
    [userId]
  );
  return rows.map(toAddressResponse);
}

export async function createAddress(userId, data) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const customerId = await ensureCustomer(connection, userId);
    const [countRows] = await connection.query(`SELECT COUNT(*) as total FROM shipping_addresses WHERE customer_id = ?`, [customerId]);
    if (countRows[0].total >= ADDRESS_LIMIT) throw Object.assign(new Error('Bạn đã đạt giới hạn số lượng địa chỉ.'), { statusCode: 400 });
    const makeDefault = Boolean(data.is_default);
    if (makeDefault) {
      await connection.query(`UPDATE shipping_addresses SET is_default = 0 WHERE customer_id = ? AND is_default = 1`, [customerId]);
    } else {
      const [existing] = await connection.query(`SELECT 1 FROM shipping_addresses WHERE customer_id = ? LIMIT 1`, [customerId]);
      if (!existing.length) data.is_default = true;
    }
    const [result] = await connection.query(
      `INSERT INTO shipping_addresses (customer_id, receiver_name, receiver_phone, province, district, ward, detail_address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, data.receiver_name, data.receiver_phone, data.province, data.district, data.ward, data.detail_address, data.is_default ? 1 : 0]
    );
    const [row] = await connection.query(`SELECT * FROM shipping_addresses WHERE id = ?`, [result.insertId]);
    await connection.commit();
    return toAddressResponse(row[0]);
  } finally {
    connection.release();
  }
}

export async function updateAddress(userId, addressId, data) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const customerId = await ensureCustomer(connection, userId);
    const [rows] = await connection.query(`SELECT * FROM shipping_addresses WHERE id = ? AND customer_id = ? FOR UPDATE`, [addressId, customerId]);
    if (!rows.length) throw Object.assign(new Error('Không tìm thấy địa chỉ'), { statusCode: 404 });
    const current = rows[0];
    const next = { ...current, ...data };
    if (next.is_default && !current.is_default) {
      await connection.query(`UPDATE shipping_addresses SET is_default = 0 WHERE customer_id = ? AND is_default = 1 AND id <> ?`, [customerId, addressId]);
    }
    await connection.query(
      `UPDATE shipping_addresses SET receiver_name = ?, receiver_phone = ?, province = ?, district = ?, ward = ?, detail_address = ?, is_default = ? WHERE id = ?`,
      [next.receiver_name, next.receiver_phone, next.province, next.district, next.ward, next.detail_address, next.is_default ? 1 : 0, addressId]
    );
    const [updated] = await connection.query(`SELECT * FROM shipping_addresses WHERE id = ?`, [addressId]);
    await connection.commit();
    return toAddressResponse(updated[0]);
  } finally {
    connection.release();
  }
}

export async function setDefaultAddress(userId, addressId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const customerId = await ensureCustomer(connection, userId);
    const [rows] = await connection.query(`SELECT id FROM shipping_addresses WHERE id = ? AND customer_id = ? FOR UPDATE`, [addressId, customerId]);
    if (!rows.length) throw Object.assign(new Error('Không tìm thấy địa chỉ'), { statusCode: 404 });
    await connection.query(`UPDATE shipping_addresses SET is_default = 0 WHERE customer_id = ? AND is_default = 1`, [customerId]);
    await connection.query(`UPDATE shipping_addresses SET is_default = 1 WHERE id = ?`, [addressId]);
    const [updated] = await connection.query(`SELECT * FROM shipping_addresses WHERE id = ?`, [addressId]);
    await connection.commit();
    return toAddressResponse(updated[0]);
  } finally {
    connection.release();
  }
}

export async function deleteAddress(userId, addressId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const customerId = await ensureCustomer(connection, userId);
    const [rows] = await connection.query(`SELECT * FROM shipping_addresses WHERE id = ? AND customer_id = ? FOR UPDATE`, [addressId, customerId]);
    if (!rows.length) throw Object.assign(new Error('Không tìm thấy địa chỉ'), { statusCode: 404 });
    const wasDefault = Boolean(rows[0].is_default);
    await connection.query(`DELETE FROM shipping_addresses WHERE id = ?`, [addressId]);
    if (wasDefault) {
      await connection.query(
        `UPDATE shipping_addresses SET is_default = 1 WHERE id = (SELECT id FROM (SELECT id FROM shipping_addresses WHERE customer_id = ? ORDER BY created_at DESC, id DESC LIMIT 1) AS next_default)`,
        [customerId]
      );
    }
    await connection.commit();
    return { deleted: true, id: Number(addressId) };
  } finally {
    connection.release();
  }
}
