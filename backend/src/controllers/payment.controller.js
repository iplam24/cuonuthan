import db from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generateVietQrUrl } from '../utils/vietqr.js';

const PAYMENT_STATUS = { unpaid: 'UNPAID', pending: 'PENDING', processing: 'PENDING', deposited: 'DEPOSIT_PAID', deposit_paid: 'DEPOSIT_PAID', paid: 'PAID', failed: 'FAILED', refunded: 'REFUNDED' };

// Generate VietQR for an order
export const getVietQrForOrder = async (req, res, next) => {
  try {
    const { orderIdentifier } = req.params; // can be order_code or id
    const isNum = /^\d+$/.test(orderIdentifier);

    const [orders] = await db.query(
      `SELECT * FROM orders WHERE ${isNum ? 'id = ?' : 'order_code = ?'} LIMIT 1`,
      [isNum ? Number(orderIdentifier) : orderIdentifier]
    );

    if (orders.length === 0) {
      return sendError(res, 'Không tìm thấy đơn hàng', 404);
    }

    const order = orders[0];

    // Fetch bank settings
    const [settings] = await db.query(
      `SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('bank_name', 'bank_account_number', 'bank_account_holder')`
    );
    const config = settings.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    // Determine amount to pay: if deposit required and not deposited yet, suggest deposit_amount; or total_amount
    let amountToPay = order.total_amount;
    let paymentType = 'full';

    if (order.is_deposit_required && order.payment_status === 'unpaid') {
      amountToPay = order.deposit_amount || order.total_amount;
      paymentType = 'deposit';
    }

    const qrUrl = generateVietQrUrl({
      bankId: 'MB',
      accountNo: config.bank_account_number || '0988888888',
      accountName: config.bank_account_holder || 'NGUYEN THI HAN',
      amount: amountToPay,
      description: `UH ${order.order_code}`,
    });

    return sendSuccess(res, {
      order_id: order.id,
      order_code: order.order_code,
      total_amount: order.total_amount,
      deposit_amount: order.deposit_amount,
      amount_to_pay: amountToPay,
      payment_type: paymentType,
      payment_status: order.payment_status,
      bank_id: config.bank_id || 'MB',
      bank_account_no: config.bank_account_no || '0988888888',
      bank_account_name: config.bank_account_name || 'NGUYEN THI HAN',
      qr_url: qrUrl,
      transfer_syntax: `UH ${order.order_code}`,
    });
  } catch (err) {
    next(err);
  }
};

// Customer uploads payment proof (bill screenshot)
export const uploadPaymentProof = async (req, res, next) => {
  try {
    const { order_code, proof_image, notes } = req.body;

    if (!order_code || !proof_image) {
      return sendError(res, 'Vui lòng cung cấp mã đơn hàng và ảnh bằng chứng chuyển khoản', 400);
    }

    const [orders] = await db.query(`SELECT * FROM orders WHERE order_code = ?`, [order_code]);
    if (orders.length === 0) {
      return sendError(res, 'Không tìm thấy đơn hàng', 404);
    }
    const order = orders[0];

    // Find or create payment record
    const [payments] = await db.query(`SELECT * FROM payments WHERE order_id = ?`, [order.id]);
    let paymentId;

    if (payments.length > 0) {
      paymentId = payments[0].id;
      await db.query(
        `UPDATE payments SET payment_proof_image = ?, payment_notes = ?, status = 'PROCESSING' WHERE id = ?`,
        [proof_image, notes || 'Khách đã gửi hóa đơn CK', paymentId]
      );
    } else {
      const [pResult] = await db.query(
        `INSERT INTO payments (order_id, payment_method, amount, status, payment_proof_image, payment_notes)
         VALUES (?, 'BANK_TRANSFER', ?, 'PROCESSING', ?, ?)`,
        [order.id, order.total_amount, proof_image, notes || 'Khách đã gửi hóa đơn CK']
      );
      paymentId = pResult.insertId;
    }

    // Insert into payment_transactions
    await db.query(
      `INSERT INTO payment_transactions (payment_id, transaction_type, amount, proof_image, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        paymentId,
        order.deposit_amount > 0 ? 'deposit' : 'full',
        order.deposit_amount > 0 ? order.deposit_amount : order.total_amount,
        proof_image,
        notes || 'Bằng chứng CK từ khách',
      ]
    );

    // Notify admin via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('payment:proof_uploaded', {
        order_id: order.id,
        order_code: order.order_code,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        amount: order.total_amount,
        proof_image,
        notes,
        created_at: new Date(),
      });
    }

    return sendSuccess(res, {
      message: 'Đã gửi bằng chứng chuyển khoản thành công! Út Hân sẽ xác nhận sớm nhất.',
    });
  } catch (err) {
    next(err);
  }
};

// Admin confirms payment
export const confirmPayment = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { order_id } = req.params;
    const { status = 'paid', transaction_code, notes } = req.body;
    const normalizedPaymentStatus = PAYMENT_STATUS[status.toLowerCase()] || 'PAID';

    const [orders] = await connection.query(`SELECT * FROM orders WHERE id = ? FOR UPDATE`, [order_id]);
    if (orders.length === 0) {
      await connection.rollback();
      return sendError(res, 'Không tìm thấy đơn hàng', 404);
    }
    const order = orders[0];

    // Update order payment status
    await connection.query(`UPDATE orders SET payment_status = ? WHERE id = ?`, [normalizedPaymentStatus, order_id]);

    // Update payments record
    const [existingPayments] = await connection.query(`SELECT id FROM payments WHERE order_id = ? LIMIT 1`, [order_id]);
    if (existingPayments.length > 0) {
      await connection.query(
        `UPDATE payments SET status = 'SUCCESS', transaction_code = ?, paid_at = NOW(), payment_notes = ? WHERE order_id = ?`,
        [transaction_code || `TXN-${Date.now()}`, notes || 'Admin đã xác nhận thanh toán', order_id]
      );
    } else {
      await connection.query(
        `INSERT INTO payments (order_id, payment_method, amount, status, transaction_code, paid_at, payment_notes)
         VALUES (?, ?, ?, 'SUCCESS', ?, NOW(), ?)`,
        [
          order_id,
          order.payment_method || 'BANK_TRANSFER',
          order.total_amount,
          transaction_code || `TXN-${Date.now()}`,
          notes || 'Admin đã xác nhận thanh toán'
        ]
      );
    }

    // Add status history
    await connection.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by, actor_user_id, actor_role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        order.status,
        order.status,
        `Đã xác nhận thanh toán: ${normalizedPaymentStatus === 'PAID' ? 'Đã thanh toán 100%' : 'Đã nhận cọc'}`,
        req.user?.fullName || req.user?.username || (req.user?.userId ? String(req.user.userId) : 'ADMIN'),
        req.user?.userId || null,
        req.user?.role || 'admin'
      ]
    );

    await connection.commit();

    // Realtime notification
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('order:updated', { id: order.id, payment_status: normalizedPaymentStatus });
      io.to(`order_${order.order_code}`).emit('payment:confirmed', {
        order_code: order.order_code,
        payment_status: normalizedPaymentStatus.toLowerCase(),
      });
    }

    return sendSuccess(res, { message: 'Đã xác nhận thanh toán thành công!' });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

export const getVietQrInfo = getVietQrForOrder;

