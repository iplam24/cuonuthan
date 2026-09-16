import db from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generateOrderCode } from '../utils/orderCode.js';
import { generateVietQrUrl } from '../utils/vietqr.js';
import { resolveProductPrice } from '../utils/pricing.js';
import { ORDER_STATUSES, canTransition } from '../utils/orderStateMachine.js';
import { validateCreateOrder, normalizeScheduledTime } from '../utils/orderValidation.js';
import { normalizePhone } from '../utils/addressValidation.js';
import { createTrackingToken, canAccessOrder } from '../utils/orderAccess.js';

// Customer creates a new order
export const createOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_name,
      customer_phone,
      customer_email = null,
      delivery_address,
      delivery_ward = '',
      delivery_district = '',
      delivery_province = 'Hà Nội',
      delivery_note = '',
      delivery_time_type = 'now',
      scheduled_delivery_time: rawScheduledTime = null,
      payment_method = 'cod',
      coupon_code = null,
      items = [],
      shipping_address_id = null,
    } = req.body;

    const now = new Date();
    const normalizedScheduledTime = normalizeScheduledTime(rawScheduledTime, now);
    const effectiveBody = {
      ...req.body,
      scheduled_delivery_time: normalizedScheduledTime,
      delivery_time_type,
    };

    // Saved-address requests are validated after ownership resolution below.
    if (shipping_address_id != null && req.user?.userId) {
      effectiveBody.customer_name ||= 'saved-address';
      effectiveBody.customer_phone ||= req.user.phone || '0900000000';
      effectiveBody.delivery_address ||= 'saved-address';
    }
    const validation = validateCreateOrder(effectiveBody, now);
    if (!validation.valid) {
      await connection.rollback();
      return sendError(res, 'Dữ liệu đơn hàng không hợp lệ!', validation.errors, 400);
    }

    let resolvedAddress = {
      receiverName: typeof customer_name === 'string' ? customer_name.trim() : '',
      receiverPhone: typeof customer_phone === 'string' ? normalizePhone(customer_phone) : '',
      province: typeof delivery_province === 'string' ? delivery_province.trim() : 'Hà Nội',
      district: typeof delivery_district === 'string' ? delivery_district.trim() : '',
      ward: typeof delivery_ward === 'string' ? delivery_ward.trim() : '',
      detailAddress: typeof delivery_address === 'string' ? delivery_address.trim() : '',
      shippingAddressId: null,
    };

    if (shipping_address_id != null && req.user?.userId) {
      const [addressRows] = await connection.query(
        `SELECT sa.* FROM shipping_addresses sa JOIN customers c ON sa.customer_id = c.id WHERE sa.id = ? AND c.user_id = ? LIMIT 1`,
        [shipping_address_id, req.user.userId]
      );
      if (!addressRows.length) {
        await connection.rollback();
        return sendError(res, 'Địa chỉ giao hàng không tồn tại hoặc không thuộc về bạn.', [{ field: 'shipping_address_id', message: 'Địa chỉ không hợp lệ.' }], 400);
      }
      const address = addressRows[0];
      resolvedAddress = {
        receiverName: address.receiver_name,
        receiverPhone: address.receiver_phone,
        province: address.province,
        district: address.district,
        ward: address.ward,
        detailAddress: address.detail_address,
        shippingAddressId: address.id,
      };
    } else if (shipping_address_id != null && !req.user?.userId) {
      await connection.rollback();
      return sendError(res, 'Vui lòng đăng nhập để sử dụng địa chỉ đã lưu.', [{ field: 'shipping_address_id', message: 'Cần đăng nhập để dùng địa chỉ đã lưu.' }], 401);
    }

    const finalCustomerName = resolvedAddress.receiverName || (typeof customer_name === 'string' ? customer_name.trim() : '');
    const finalCustomerPhone = resolvedAddress.receiverPhone || (typeof customer_phone === 'string' ? normalizePhone(customer_phone) : '');
    const finalDeliveryAddress = resolvedAddress.detailAddress || (typeof delivery_address === 'string' ? delivery_address.trim() : '');
    const finalProvince = resolvedAddress.province || (typeof delivery_province === 'string' ? delivery_province.trim() : 'Hà Nội');
    const finalDistrict = resolvedAddress.district || (typeof delivery_district === 'string' ? delivery_district.trim() : '');
    const finalWard = resolvedAddress.ward || (typeof delivery_ward === 'string' ? delivery_ward.trim() : '');

    // 1. Fetch system settings
    const [settingsRows] = await connection.query(
      `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (
        'shipping_fee', 'free_shipping_threshold', 'deposit_threshold', 'default_deposit_amount',
        'bank_name', 'bank_account_number', 'bank_account_holder'
      )`
    );
    const settings = settingsRows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    const defaultShippingFee = Number(settings.shipping_fee) || 25000;
    const freeShippingThreshold = Number(settings.free_shipping_threshold) || 500000;
    const depositThreshold = Number(settings.deposit_threshold) || 200000;
    const defaultDepositAmount = Number(settings.default_deposit_amount) || 50000;

    // 2. Validate items and calculate subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const [pRows] = await connection.query(
        `SELECT id, name, price, sale_price, is_available, is_side_dish, daily_stock, current_stock, stock_reset_date, deleted_at FROM products WHERE id = ? FOR UPDATE`,
        [item.product_id]
      );

      if (pRows.length === 0) {
        await connection.rollback();
        return sendError(res, `Món ăn mã #${item.product_id} không tồn tại!`, 400);
      }

      const product = pRows[0];
      if (product.deleted_at) {
        await connection.rollback();
        return sendError(res, `Món "${product.name}" hiện tạm ngừng phục vụ!`, 400);
      }

      if (product.is_available === 0) {
        await connection.rollback();
        return sendError(res, `Món "${product.name}" đã hết hàng! Vui lòng chọn món khác.`, 400);
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Check daily stock limit
      let availableStock = product.current_stock;
      if (product.daily_stock != null) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const resetDateStr = product.stock_reset_date ? new Date(product.stock_reset_date).toISOString().slice(0, 10) : null;
        if (!resetDateStr || resetDateStr < todayStr) {
          availableStock = product.daily_stock;
          await connection.query(
            `UPDATE products SET current_stock = ?, stock_reset_date = CURRENT_DATE() WHERE id = ?`,
            [product.daily_stock, product.id]
          );
        }
      }

      if (product.daily_stock != null && availableStock != null && availableStock < qty) {
        await connection.rollback();
        return sendError(
          res,
          `Món "${product.name}" hôm nay chỉ còn ${availableStock} suất! Vui lòng giảm số lượng.`,
          [{ field: 'items', message: `Số lượng vượt quá suất còn lại (${availableStock})` }],
          400
        );
      }

      if (product.daily_stock != null && availableStock != null) {
        await connection.query(
          `UPDATE products SET current_stock = current_stock - ?, stock_reset_date = CURRENT_DATE() WHERE id = ?`,
          [qty, product.id]
        );
      }

      const [imgRows] = await connection.query(
        `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC LIMIT 1`,
        [product.id]
      );
      const primaryImage = imgRows[0]?.image_url || '';

      const { current_price } = resolveProductPrice(product);
      const itemTotal = current_price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: current_price,
        quantity: qty,
        total_price: itemTotal,
        note: item.note || '',
        primary_image: primaryImage,
        is_side_dish: Boolean(product.is_side_dish),
      });
    }

    // Side-dish rule: if any side dish is ordered, order must contain at least one main dish (is_side_dish = 0)
    const hasSideDish = validatedItems.some((item) => item.is_side_dish);
    const hasMainDish = validatedItems.some((item) => !item.is_side_dish);
    if (hasSideDish && !hasMainDish) {
      await connection.rollback();
      return sendError(
        res,
        'Đơn hàng có món phụ/ăn kèm bắt buộc phải có ít nhất một món chính!',
        [{ field: 'items', message: 'Đơn hàng phải có ít nhất một món chính khi chọn món phụ/ăn kèm.' }],
        400
      );
    }

    // 3. Calculate shipping fee
    let shippingFee = subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;

    // 4. Calculate coupon discount
    let discountAmount = 0;
    let validCouponId = null;

    if (coupon_code) {
      const [cRows] = await connection.query(
        `SELECT * FROM coupons 
         WHERE UPPER(code) = ? AND is_active = 1 
         AND (end_date IS NULL OR end_date > NOW()) 
         AND (start_date IS NULL OR start_date <= NOW())
         FOR UPDATE`,
        [coupon_code.trim().toUpperCase()]
      );

      if (cRows.length > 0) {
        const coupon = cRows[0];
        const minOrder = Number(coupon.min_order_value || 0);
        if (coupon.used_count < coupon.usage_limit && subtotal >= minOrder) {
          validCouponId = coupon.id;
          if (coupon.discount_type === 'percentage' || coupon.discount_type === 'percent') {
            discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
              discountAmount = Number(coupon.max_discount);
            }
          } else {
            discountAmount = Number(coupon.discount_value);
          }
        }
      }
    }

    // 4.5. Calculate loyalty points discount
    let pointsUsed = 0;
    let pointsDiscount = 0;
    if (req.body.use_points && Number(req.body.use_points) > 0 && req.user?.userId) {
      const [custRows] = await connection.query(`SELECT id, loyalty_points FROM customers WHERE user_id = ? LIMIT 1`, [req.user.userId]);
      if (custRows.length > 0 && custRows[0].loyalty_points > 0) {
        const maxDiscountAllowed = Math.floor(subtotal * 0.20);
        const requestedPoints = Math.max(0, parseInt(req.body.use_points, 10) || 0);
        pointsUsed = Math.min(custRows[0].loyalty_points, requestedPoints, Math.floor(maxDiscountAllowed / 1000));
        pointsDiscount = pointsUsed * 1000;
      }
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount - pointsDiscount);

    // 5. Deposit calculation
    const isDepositRequired = totalAmount >= depositThreshold && payment_method === 'cod';
    const depositAmount = isDepositRequired ? Math.min(defaultDepositAmount, totalAmount) : 0;
    const remainingAmount = Math.max(0, totalAmount - depositAmount);

    // 6. Handle Customer record (table customers: phone, full_name, email, total_orders, total_spent)
    const identityPhone = finalCustomerPhone;
    if (!identityPhone || !finalCustomerName || !finalDeliveryAddress) {
      await connection.rollback();
      return sendError(res, 'Thông tin người nhận và địa chỉ giao hàng không được để trống.', [
        { field: 'customer_phone', message: 'Số điện thoại không hợp lệ.' },
        { field: 'customer_name', message: 'Tên khách hàng không hợp lệ.' },
        { field: 'delivery_address', message: 'Địa chỉ giao hàng không hợp lệ.' },
      ], 400);
    }

    let customerId = null;
    if (req.user?.userId) {
      const [custByUser] = await connection.query(`SELECT id FROM customers WHERE user_id = ? LIMIT 1`, [req.user.userId]);
      if (custByUser.length > 0) {
        customerId = custByUser[0].id;
        await connection.query(
          `UPDATE customers SET email = COALESCE(?, email), total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?`,
          [customer_email, totalAmount, customerId]
        );
      } else {
        const [userRows] = await connection.query(`SELECT phone, full_name, email FROM users WHERE id = ? LIMIT 1`, [req.user.userId]);
        if (!userRows.length) throw Object.assign(new Error('Không tìm thấy người dùng'), { statusCode: 401 });
        const account = userRows[0];
        const [newCust] = await connection.query(
          `INSERT INTO customers (user_id, phone, full_name, email, total_orders, total_spent) VALUES (?, ?, ?, ?, 1, ?)`,
          [req.user.userId, account.phone, account.full_name, account.email || customer_email, totalAmount]
        );
        customerId = newCust.insertId;
      }
    } else {
      const [existingCust] = await connection.query(`SELECT id FROM customers WHERE phone = ? LIMIT 1`, [identityPhone]);
      if (existingCust.length > 0) {
        customerId = existingCust[0].id;
        await connection.query(
          `UPDATE customers SET full_name = ?, email = COALESCE(?, email), total_orders = total_orders + 1, total_spent = total_spent + ? WHERE id = ?`,
          [finalCustomerName, customer_email, totalAmount, customerId]
        );
      } else {
        const [newCust] = await connection.query(
          `INSERT INTO customers (user_id, phone, full_name, email, total_orders, total_spent) VALUES (?, ?, ?, ?, 1, ?)`,
          [null, identityPhone, finalCustomerName, customer_email, totalAmount]
        );
        customerId = newCust.insertId;
      }
    }

    // 7. Generate order code and insert order
    let orderCode = generateOrderCode();
    let isUnique = false;
    while (!isUnique) {
      const [chk] = await connection.query(`SELECT id FROM orders WHERE order_code = ?`, [orderCode]);
      if (chk.length === 0) {
        isUnique = true;
      } else {
        orderCode = generateOrderCode();
      }
    }

    const orderNoteCombined = delivery_time_type === 'scheduled' && normalizedScheduledTime
      ? `[Hẹn giờ: ${normalizedScheduledTime}] ${delivery_note}`
      : delivery_note;

    const dbPaymentMethod = (payment_method || 'cod').toLowerCase().includes('bank') || (payment_method || '').toLowerCase() === 'vietqr'
      ? 'VIETQR'
      : 'COD';

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_code, customer_id, customer_name, customer_phone,
        delivery_address, province, district, ward,
        note, scheduled_delivery_time, subtotal, shipping_fee, discount_amount,
        points_used, points_discount,
        deposit_amount, remaining_amount, total_amount,
        payment_method, payment_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', 'PENDING')`,
      [
        orderCode,
        customerId,
        finalCustomerName,
        finalCustomerPhone,
        finalDeliveryAddress,
        finalProvince,
        finalDistrict,
        finalWard,
        orderNoteCombined,
        delivery_time_type === 'scheduled' && normalizedScheduledTime ? normalizedScheduledTime : null,
        subtotal,
        shippingFee,
        discountAmount,
        pointsUsed,
        pointsDiscount,
        depositAmount,
        remainingAmount,
        totalAmount,
        dbPaymentMethod,
      ]
    );

    const orderId = orderResult.insertId;

    // Deduct points from customer and record transaction
    if (pointsUsed > 0 && customerId) {
      await connection.query(`UPDATE customers SET loyalty_points = GREATEST(0, loyalty_points - ?) WHERE id = ?`, [pointsUsed, customerId]);
      await connection.query(
        `INSERT INTO loyalty_transactions (customer_id, order_id, points_change, type, reason) VALUES (?, ?, ?, 'REDEEM', ?)`,
        [customerId, orderId, -pointsUsed, 'Dùng điểm giảm giá đơn hàng']
      );
    }

    // 8. Insert Order items (order_items table columns: order_id, product_id, product_name, price, quantity, total_price, note)
    const itemInserts = validatedItems.map((item) => [
      orderId,
      item.product_id,
      item.product_name,
      item.unit_price,
      item.quantity,
      item.total_price,
      item.note,
    ]);

    await connection.query(
      `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total_price, note)
       VALUES ?`,
      [itemInserts]
    );

    // 9. Insert order status history (order_status_history table: order_id, old_status, new_status, note, changed_by)
    await connection.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by, actor_user_id, actor_role)
       VALUES (?, NULL, 'PENDING', 'Khách hàng đặt đơn trực tuyến', ?, ?, ?)`,
      [orderId, req.user?.fullName || req.user?.username || (req.user?.userId ? String(req.user.userId) : 'SYSTEM'), req.user?.userId || null, req.user?.role || 'customer']
    );

    // 10. Record initial payment record
    await connection.query(
      `INSERT INTO payments (order_id, payment_method, amount, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [orderId, dbPaymentMethod, totalAmount]
    );

    // 11. Update coupon usage
    if (validCouponId) {
      await connection.query(
        `UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`,
        [validCouponId]
      );
      await connection.query(
        `INSERT INTO coupon_usages (coupon_id, order_id, customer_id)
         VALUES (?, ?, ?)`,
        [validCouponId, orderId, customerId]
      );
    }

    await connection.commit();

    // 12. Prepare response and VietQR if banking or deposit needed
    let qrData = null;
    if (payment_method === 'banking' || isDepositRequired) {
      const payAmount = payment_method === 'banking' ? totalAmount : depositAmount;
      const qrUrl = generateVietQrUrl({
        bankId: 'MB',
        accountNo: settings.bank_account_number || '0988888888',
        accountName: settings.bank_account_holder || 'NGUYEN THI HAN',
        amount: payAmount,
        description: `UH ${orderCode}`,
      });

      qrData = {
        qr_url: qrUrl,
        bank_id: 'MB',
        account_no: settings.bank_account_number || '0988888888',
        account_name: settings.bank_account_holder || 'NGUYEN THI HAN',
        amount: payAmount,
        syntax: `UH ${orderCode}`,
      };
    }

    const orderSummary = {
      id: orderId,
      order_code: orderCode,
      customer_name: finalCustomerName,
      customer_phone: finalCustomerPhone,
      delivery_address: finalDeliveryAddress,
      province: finalProvince,
      district: finalDistrict,
      ward: finalWard,
      scheduled_delivery_time: delivery_time_type === 'scheduled' ? normalizedScheduledTime : null,
      shipping_address_id: resolvedAddress.shippingAddressId,
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      remaining_amount: remainingAmount,
      is_deposit_required: isDepositRequired,
      payment_method,
      payment_status: 'unpaid',
      status: 'pending',
      items: validatedItems,
      vietqr: qrData,
      tracking_token: createTrackingToken(orderCode, customer_phone),
      created_at: new Date(),
    };

    // 13. Emit Realtime event to Admin
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('order:created', orderSummary);
    }

    return sendSuccess(res, orderSummary, 'Đặt món thành công!', 201);
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

// Customer order tracking by order code
export const getOrderTracking = async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const trackingToken = req.headers['x-tracking-token'] || req.query.tracking_token;
    const phone = req.headers['x-tracking-phone'] || req.query.phone;

    const [orders] = await db.query(
      `SELECT o.*, c.user_id as customer_user_id
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.order_code = ? LIMIT 1`,
      [orderCode.trim()]
    );

    if (orders.length === 0) {
      return sendError(res, 'Không tìm thấy thông tin đơn hàng với mã này!', 404);
    }

    const order = orders[0];
    if (!canAccessOrder({ user: req.user, trackingToken, phone, order })) {
      return sendError(res, 'Vui lòng cung cấp mã theo dõi hoặc xác minh số điện thoại để xem đơn hàng.', 403);
    }

    // Fetch items with product images
    const [items] = await db.query(
      `SELECT oi.*,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
       FROM order_items oi
       WHERE oi.order_id = ?`,
      [order.id]
    );

    // Fetch status history
    const [history] = await db.query(
      `SELECT osh.*, u.full_name as changed_by_name
       FROM order_status_history osh
       LEFT JOIN users u ON osh.changed_by = u.id
       WHERE osh.order_id = ?
       ORDER BY osh.created_at ASC`,
      [order.id]
    );

    // Fetch payment record
    const [payments] = await db.query(
      `SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1`,
      [order.id]
    );

    // Fetch shipper info if assigned
    let shipper = null;
    if (order.shipper_id) {
      const [shippers] = await db.query(
        `SELECT id, full_name as name, phone, vehicle_plate FROM shippers WHERE id = ?`,
        [order.shipper_id]
      );
      if (shippers.length > 0) shipper = shippers[0];
    }

    // Generate VietQR URL if unpaid
    let vietqr = null;
    const isUnpaid = (order.payment_status || '').toUpperCase() === 'UNPAID';
    if (isUnpaid || (order.deposit_amount > 0 && isUnpaid)) {
      const [settingsRows] = await db.query(
        `SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('bank_name', 'bank_account_number', 'bank_account_holder')`
      );
      const settings = settingsRows.reduce((acc, row) => {
        acc[row.setting_key] = row.setting_value;
        return acc;
      }, {});

      const payAmount = (order.deposit_amount > 0 && order.payment_method === 'cod')
        ? order.deposit_amount
        : order.total_amount;

      vietqr = {
        qr_url: generateVietQrUrl({
          bankId: 'MB',
          accountNo: settings.bank_account_number || '0988888888',
          accountName: settings.bank_account_holder || 'NGUYEN THI HAN',
          amount: payAmount,
          description: `UH ${order.order_code}`,
        }),
        bank_id: 'MB',
        account_no: settings.bank_account_number || '0988888888',
        account_name: settings.bank_account_holder || 'NGUYEN THI HAN',
        amount: payAmount,
        syntax: `UH ${order.order_code}`,
      };
    }

    return sendSuccess(res, {
      ...order,
      delivery_note: order.note,
      items,
      history,
      payment: payments[0] || null,
      shipper,
      vietqr,
      tracking_token: createTrackingToken(order.order_code, order.customer_phone),
    });
  } catch (err) {
    next(err);
  }
};

// Customer viewing their own past orders
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userPhone = req.user.phone;

    const [orders] = await db.query(
      `SELECT o.*, COUNT(oi.id) as total_items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE c.user_id = ? OR o.customer_phone = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId, userPhone]
    );

    return sendSuccess(res, orders);
  } catch (err) {
    next(err);
  }
};

// Admin: Get all orders with search, filter, pagination
export const getAdminOrders = async (req, res, next) => {
  try {
    const {
      status,
      payment_status,
      search,
      start_date,
      end_date,
      include_active,
      page = 1,
      limit = 20,
    } = req.query;

    let query = `
      SELECT o.*, s.full_name as shipper_name, s.phone as shipper_phone
      FROM orders o
      LEFT JOIN shippers s ON o.shipper_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND UPPER(o.status) = ?`;
      params.push(status.toUpperCase());
    }

    if (payment_status) {
      query += ` AND UPPER(o.payment_status) = ?`;
      params.push(payment_status.toUpperCase());
    }

    if (search) {
      query += ` AND (o.order_code LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const shouldIncludeActive = include_active === 'true' || include_active === true || include_active === '1';

    if (start_date && end_date) {
      if (shouldIncludeActive && !status) {
        query += ` AND ((o.created_at >= ? AND o.created_at <= ?) OR UPPER(o.status) IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING'))`;
        params.push(`${start_date} 00:00:00`, `${end_date} 23:59:59`);
      } else {
        query += ` AND o.created_at >= ? AND o.created_at <= ?`;
        params.push(`${start_date} 00:00:00`, `${end_date} 23:59:59`);
      }
    } else if (start_date) {
      if (shouldIncludeActive && !status) {
        query += ` AND (o.created_at >= ? OR UPPER(o.status) IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING'))`;
        params.push(`${start_date} 00:00:00`);
      } else {
        query += ` AND o.created_at >= ?`;
        params.push(`${start_date} 00:00:00`);
      }
    } else if (end_date) {
      if (shouldIncludeActive && !status) {
        query += ` AND (o.created_at <= ? OR UPPER(o.status) IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING'))`;
        params.push(`${end_date} 23:59:59`);
      } else {
        query += ` AND o.created_at <= ?`;
        params.push(`${end_date} 23:59:59`);
      }
    }

    const countSql = `SELECT COUNT(*) as total FROM (${query}) as count_table`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;
    params.push(limitNum, offset);

    const [orders] = await db.query(query, params);

    // Fetch items summary for list view
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const [items] = await db.query(
        `SELECT order_id, product_name, quantity, price as unit_price, total_price, note
         FROM order_items WHERE order_id IN (?)`,
        [orderIds]
      );

      const itemsByOrder = items.reduce((acc, it) => {
        if (!acc[it.order_id]) acc[it.order_id] = [];
        acc[it.order_id].push(it);
        return acc;
      }, {});

      orders.forEach((ord) => {
        ord.items = itemsByOrder[ord.id] || [];
        ord.delivery_note = ord.note;
        ord.status = (ord.status || '').toLowerCase();
        ord.payment_status = (ord.payment_status || '').toLowerCase();
        ord.payment_method = (ord.payment_method || '').toLowerCase();
      });
    }

    return sendSuccess(res, {
      items: orders,
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

// Admin: Get single order details
export const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `SELECT o.*, s.full_name as shipper_name, s.phone as shipper_phone, s.vehicle_plate
       FROM orders o
       LEFT JOIN shippers s ON o.shipper_id = s.id
       WHERE o.id = ? LIMIT 1`,
      [id]
    );

    if (orders.length === 0) {
      return sendError(res, 'Không tìm thấy đơn hàng', 404);
    }

    const order = orders[0];
    order.delivery_note = order.note;

    // Items
    const [items] = await db.query(
      `SELECT oi.*, oi.price as unit_price,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
       FROM order_items oi
       WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;

    // Status history
    const [history] = await db.query(
      `SELECT osh.*, u.full_name as changed_by_name
       FROM order_status_history osh
       LEFT JOIN users u ON osh.changed_by = u.id
       WHERE osh.order_id = ?
       ORDER BY osh.created_at ASC`,
      [order.id]
    );
    order.history = history;

    // Payments
    const [payments] = await db.query(
      `SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC`,
      [order.id]
    );
    order.payments = payments;

    // Admin Notes
    const [notes] = await db.query(
      `SELECT an.id, an.order_id, an.admin_id, an.note_content as note, an.created_at, u.full_name as author_name
       FROM admin_notes an
       LEFT JOIN users u ON an.admin_id = u.id
       WHERE an.order_id = ?
       ORDER BY an.created_at DESC`,
      [order.id]
    );
    order.admin_notes = notes;

    return sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    const statusUpper = String(status || '').toUpperCase();
    if (!ORDER_STATUSES.includes(statusUpper)) {
      return sendError(res, 'Trạng thái đơn hàng không hợp lệ!', [], 400);
    }

    const [orders] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (orders.length === 0) {
      return sendError(res, 'Không tìm thấy đơn hàng', 404);
    }
    const order = orders[0];

    if (!canTransition(order.status, statusUpper)) {
      return sendError(
        res,
        `Không thể chuyển trạng thái từ ${order.status} sang ${statusUpper}.`,
        [{ field: 'status', message: `Chuyển đổi trạng thái không hợp lệ: ${order.status} -> ${statusUpper}` }],
        409
      );
    }

    await db.query(`UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`, [statusUpper, id]);

    // When COMPLETED: award loyalty points and update customer rank
    if (statusUpper === 'COMPLETED' && order.customer_id) {
      const pointsEarned = Math.floor(Number(order.total_amount) / 10000);
      if (pointsEarned > 0) {
        await db.query(
          `UPDATE customers SET loyalty_points = loyalty_points + ?, total_spent = total_spent + ?, total_orders = total_orders + 1 WHERE id = ?`,
          [pointsEarned, order.total_amount, order.customer_id]
        );
        await db.query(
          `INSERT INTO loyalty_transactions (customer_id, order_id, points_change, type, reason) VALUES (?, ?, ?, 'EARN', ?)`,
          [order.customer_id, order.id, pointsEarned, 'Tích điểm đơn hàng hoàn thành']
        );
      } else {
        await db.query(
          `UPDATE customers SET total_spent = total_spent + ?, total_orders = total_orders + 1 WHERE id = ?`,
          [order.total_amount, order.customer_id]
        );
      }

      // Update customer rank based on new total spent
      const [custRows] = await db.query(`SELECT total_spent FROM customers WHERE id = ? LIMIT 1`, [order.customer_id]);
      if (custRows.length > 0) {
        const spent = Number(custRows[0].total_spent) || 0;
        let newRank = 'new';
        if (spent >= 5000000) newRank = 'vip';
        else if (spent >= 2000000) newRank = 'loyal';
        else if (spent >= 500000) newRank = 'regular';
        await db.query(`UPDATE customers SET rank_level = ? WHERE id = ?`, [newRank, order.customer_id]);
      }
    }

    // When CANCELLED: restore product stock and refund loyalty points
    if (statusUpper === 'CANCELLED') {
      const [items] = await db.query(`SELECT product_id, quantity FROM order_items WHERE order_id = ?`, [order.id]);
      for (const it of items) {
        if (it.product_id) {
          await db.query(
            `UPDATE products SET current_stock = LEAST(daily_stock, current_stock + ?) WHERE id = ? AND daily_stock IS NOT NULL`,
            [it.quantity, it.product_id]
          );
        }
      }
      if (order.points_used > 0 && order.customer_id) {
        await db.query(`UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?`, [order.points_used, order.customer_id]);
        await db.query(
          `INSERT INTO loyalty_transactions (customer_id, order_id, points_change, type, reason) VALUES (?, ?, ?, 'REFUND', ?)`,
          [order.customer_id, order.id, order.points_used, 'Hoàn điểm do đơn hàng bị hủy']
        );
      }
    }

    // Insert history
    await db.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by, actor_user_id, actor_role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        order.status,
        statusUpper,
        note || `Cập nhật trạng thái sang ${statusUpper}`,
        req.user ? String(req.user.userId ?? req.user.id) : 'ADMIN',
        req.user?.userId ?? req.user?.id ?? null,
        req.user?.role || 'admin',
      ]
    );

    // Socket.IO Emit
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('order:status_updated', {
        id: Number(id),
        order_code: order.order_code,
        status: status.toLowerCase(),
        note,
      });
      io.to(`order_${order.order_code}`).emit('order:status_updated', {
        order_code: order.order_code,
        status: status.toLowerCase(),
        note,
      });
    }

    return sendSuccess(res, { id, status: status.toLowerCase(), message: 'Cập nhật trạng thái đơn hàng thành công!' });
  } catch (err) {
    next(err);
  }
};

// Customer cancel order
export const cancelMyOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { cancel_reason } = req.body;
    const actorUserId = req.user?.userId ?? req.user?.id ?? null;
    const actorPhone = req.user?.phone ? String(req.user.phone).trim() : null;

    if (!cancel_reason || !String(cancel_reason).trim()) {
      return sendError(
        res,
        'Vui lòng cung cấp lý do hủy đơn hàng!',
        [{ field: 'cancel_reason', message: 'Lý do hủy đơn không được để trống.' }],
        400
      );
    }

    await connection.beginTransaction();

    const [orders] = await connection.query(
      `SELECT o.*, c.user_id as customer_user_id
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ? OR o.order_code = ?
       LIMIT 1
       FOR UPDATE`,
      [id, id]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return sendError(res, 'Không tìm thấy đơn hàng!', [], 404);
    }

    const order = orders[0];

    // Ownership check: must match customer user_id or customer_phone
    const isOwnerByUser = actorUserId && (order.customer_user_id === actorUserId);
    const isOwnerByPhone = actorPhone && (order.customer_phone === actorPhone);

    if (!isOwnerByUser && !isOwnerByPhone) {
      await connection.rollback();
      return sendError(res, 'Bạn không có quyền hủy đơn hàng này!', [], 403);
    }

    const currentStatus = String(order.status || '').toUpperCase();
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    if (!cancellableStatuses.includes(currentStatus)) {
      await connection.rollback();
      return sendError(
        res,
        `Đơn hàng đang ở trạng thái ${currentStatus}, không thể hủy! Chỉ có thể hủy khi đơn ở trạng thái PENDING hoặc CONFIRMED.`,
        [{ field: 'status', message: `Không thể hủy đơn hàng ở trạng thái ${currentStatus}` }],
        409
      );
    }

    const trimmedReason = String(cancel_reason).trim();

    await connection.query(
      `UPDATE orders SET
        status = 'CANCELLED',
        cancel_reason = ?,
        cancelled_at = NOW(),
        cancelled_by = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [trimmedReason, actorUserId, order.id]
    );

    await connection.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by, actor_user_id, actor_role)
       VALUES (?, ?, 'CANCELLED', ?, ?, ?, ?)`,
      [
        order.id,
        currentStatus,
        `Khách hàng hủy đơn: ${trimmedReason}`,
        req.user?.fullName || req.user?.username || (actorUserId ? String(actorUserId) : 'CUSTOMER'),
        actorUserId,
        req.user?.role || 'customer',
      ]
    );

    // Restore product stock and refund loyalty points
    const [cancelledItems] = await connection.query(`SELECT product_id, quantity FROM order_items WHERE order_id = ?`, [order.id]);
    for (const it of cancelledItems) {
      if (it.product_id) {
        await connection.query(
          `UPDATE products SET current_stock = LEAST(daily_stock, current_stock + ?) WHERE id = ? AND daily_stock IS NOT NULL`,
          [it.quantity, it.product_id]
        );
      }
    }
    if (order.points_used > 0 && order.customer_id) {
      await connection.query(`UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?`, [order.points_used, order.customer_id]);
      await connection.query(
        `INSERT INTO loyalty_transactions (customer_id, order_id, points_change, type, reason) VALUES (?, ?, ?, 'REFUND', ?)`,
        [order.customer_id, order.id, order.points_used, 'Hoàn điểm do đơn hàng bị hủy']
      );
    }

    await connection.commit();

    // Socket.IO Emit
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('order:status_updated', {
        id: Number(order.id),
        order_code: order.order_code,
        status: 'cancelled',
        cancel_reason: trimmedReason,
        note: `Khách hàng hủy đơn: ${trimmedReason}`,
      });
      io.to(`order_${order.order_code}`).emit('order:status_updated', {
        order_code: order.order_code,
        status: 'cancelled',
        cancel_reason: trimmedReason,
        note: `Khách hàng hủy đơn: ${trimmedReason}`,
      });
    }

    return sendSuccess(res, {
      id: order.id,
      order_code: order.order_code,
      status: 'cancelled',
      cancel_reason: trimmedReason,
    }, 'Hủy đơn hàng thành công!');
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

export const assignShipper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shipper_id } = req.body;

    const [shippers] = await db.query(`SELECT * FROM shippers WHERE id = ?`, [shipper_id]);
    if (shippers.length === 0) {
      return sendError(res, 'Không tìm thấy shipper này!', 404);
    }
    const shipper = shippers[0];

    await db.query(`UPDATE orders SET shipper_id = ?, updated_at = NOW() WHERE id = ?`, [shipper_id, id]);

    // Add note to history
    await db.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by)
       VALUES (?, (SELECT status FROM orders WHERE id = ?), (SELECT status FROM orders WHERE id = ?), ?, ?)`,
      [id, id, id, `Đã bàn giao cho shipper: ${shipper.full_name} (${shipper.phone})`, req.user ? String(req.user.id) : 'ADMIN']
    );

    return sendSuccess(res, { id, shipper_id, message: `Đã phân công shipper ${shipper.full_name}` });
  } catch (err) {
    next(err);
  }
};

// Admin: Add internal note
export const addAdminNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return sendError(res, 'Nội dung ghi chú không được trống!', 400);
    }

    const [result] = await db.query(
      `INSERT INTO admin_notes (order_id, admin_id, note_content) VALUES (?, ?, ?)`,
      [id, req.user ? req.user.id : null, note.trim()]
    );

    return sendSuccess(res, {
      id: result.insertId,
      order_id: id,
      note: note.trim(),
      created_at: new Date(),
    }, 'Đã thêm ghi chú nội bộ');
  } catch (err) {
    next(err);
  }
};
