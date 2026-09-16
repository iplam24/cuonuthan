import bcrypt from 'bcryptjs';
import { dbPool } from '../config/database.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function login(req, res) {
  try {
    const { identifier, phone, username, email, password } = req.body;
    const loginId = identifier || phone || username || email;

    if (!loginId || !password) {
      return sendError(res, 'Vui lòng nhập tên đăng nhập/SĐT và mật khẩu!', [], 400);
    }

    const [rows] = await dbPool.query(
      `SELECT u.*, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.phone = ? OR u.email = ?
       LIMIT 1`,
      [loginId, loginId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Tài khoản hoặc mật khẩu không chính xác!', [], 401);
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return sendError(res, 'Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa!', [], 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Tài khoản hoặc mật khẩu không chính xác!', [], 401);
    }

    const token = signToken({
      userId: user.id,
      role: user.role_name,
      phone: user.phone,
      fullName: user.full_name
    });

    const userProfile = {
      id: user.id,
      role: user.role_name,
      fullName: user.full_name,
      phone: user.phone,
      email: user.email,
      avatarUrl: user.avatar_url
    };

    return sendSuccess(res, { token, user: userProfile }, 'Đăng nhập thành công!');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function register(req, res) {
  try {
    const { phone, fullName, password, email } = req.body;

    if (!phone || !fullName || !password) {
      return sendError(res, 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Mật khẩu!', [], 400);
    }

    const [existing] = await dbPool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return sendError(res, 'Số điện thoại này đã được đăng ký!', [], 400);
    }

    const [[customerRole]] = await dbPool.query("SELECT id FROM roles WHERE name = 'customer'");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [insertResult] = await dbPool.query(
      `INSERT INTO users (role_id, phone, email, password_hash, full_name, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [customerRole.id, phone, email || null, hash, fullName]
    );

    // Tạo bản ghi customer tương ứng
    await dbPool.query(
      `INSERT INTO customers (user_id, phone, full_name, email)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
      [insertResult.insertId, phone, fullName, email || null]
    );

    const token = signToken({
      userId: insertResult.insertId,
      role: 'customer',
      phone,
      fullName
    });

    return sendSuccess(res, {
      token,
      user: {
        id: insertResult.insertId,
        role: 'customer',
        fullName,
        phone,
        email: email || null
      }
    }, 'Đăng ký tài khoản thành công!', 201);
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function getMe(req, res) {
  try {
    const userId = req.user.userId;
    const [rows] = await dbPool.query(
      `SELECT u.id, u.phone, u.email, u.full_name, u.avatar_url, u.status, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Không tìm thấy người dùng!', [], 404);
    }

    const user = rows[0];
    return sendSuccess(res, {
      id: user.id,
      role: user.role,
      fullName: user.full_name,
      phone: user.phone,
      email: user.email,
      avatarUrl: user.avatar_url
    });
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function forgotPassword(req, res) {
  try {
    const { phone_or_email, phone, email } = req.body;
    const identifier = (phone_or_email || phone || email || '').trim();

    if (!identifier) {
      return sendError(res, 'Vui lòng cung cấp số điện thoại hoặc email!', [], 400);
    }

    const [users] = await dbPool.query(
      `SELECT id, phone, email, full_name FROM users WHERE phone = ? OR email = ? LIMIT 1`,
      [identifier, identifier]
    );

    if (users.length === 0) {
      return sendError(res, 'Không tìm thấy tài khoản tương ứng với thông tin đã nhập!', [], 404);
    }

    const user = users[0];
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = (await import('crypto')).default.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await dbPool.query(
      `INSERT INTO password_resets (phone_or_email, otp_code, token, expires_at)
       VALUES (?, ?, ?, ?)`,
      [user.phone, otpCode, token, expiresAt]
    );

    console.log(`\n==============================================`);
    console.log(`[MÃ XÁC THỰC OTP] Khôi phục mật khẩu cho: ${user.phone}`);
    console.log(`MÃ OTP: ${otpCode} (Hết hạn trong 10 phút)`);
    console.log(`==============================================\n`);

    const isDev = process.env.NODE_ENV !== 'production';

    return sendSuccess(
      res,
      {
        phone: user.phone,
        expires_in_seconds: 600,
        ...(isDev ? { debug_otp: otpCode } : {})
      },
      'Mã xác thực OTP đã được gửi! Vui lòng kiểm tra tin nhắn.'
    );
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function verifyOtp(req, res) {
  try {
    const { phone_or_email, otp_code } = req.body;

    if (!phone_or_email || !otp_code) {
      return sendError(res, 'Vui lòng nhập đầy đủ thông tin và mã OTP!', [], 400);
    }

    const [rows] = await dbPool.query(
      `SELECT * FROM password_resets
       WHERE phone_or_email = ? AND otp_code = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [phone_or_email.trim(), String(otp_code).trim()]
    );

    if (rows.length === 0) {
      return sendError(res, 'Mã OTP không chính xác hoặc đã hết hạn!', [], 400);
    }

    return sendSuccess(res, {
      reset_token: rows[0].token
    }, 'Xác thực OTP thành công!');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function resetPassword(req, res) {
  try {
    const { reset_token, new_password } = req.body;

    if (!reset_token || !new_password) {
      return sendError(res, 'Vui lòng cung cấp mã xác nhận và mật khẩu mới!', [], 400);
    }

    if (String(new_password).length < 6) {
      return sendError(res, 'Mật khẩu mới phải có ít nhất 6 ký tự!', [], 400);
    }

    const [rows] = await dbPool.query(
      `SELECT * FROM password_resets
       WHERE token = ? AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [reset_token.trim()]
    );

    if (rows.length === 0) {
      return sendError(res, 'Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!', [], 400);
    }

    const resetRecord = rows[0];
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(new_password, salt);

    await dbPool.query(
      `UPDATE users SET password_hash = ? WHERE phone = ? OR email = ?`,
      [hash, resetRecord.phone_or_email, resetRecord.phone_or_email]
    );

    await dbPool.query(
      `UPDATE password_resets SET used_at = NOW() WHERE id = ?`,
      [resetRecord.id]
    );

    return sendSuccess(res, null, 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}

export async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user?.userId;

    if (!current_password || !new_password) {
      return sendError(res, 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!', [], 400);
    }

    if (String(new_password).length < 6) {
      return sendError(res, 'Mật khẩu mới phải có tối thiểu 6 ký tự!', [], 400);
    }

    const [rows] = await dbPool.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) {
      return sendError(res, 'Không tìm thấy tài khoản người dùng!', [], 404);
    }

    const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!isMatch) {
      return sendError(res, 'Mật khẩu hiện tại không chính xác!', [], 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(new_password, salt);
    await dbPool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);

    return sendSuccess(res, null, 'Đổi mật khẩu thành công!');
  } catch (error) {
    return sendError(res, error.message, [], 500);
  }
}


