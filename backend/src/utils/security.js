import crypto from 'crypto';

export function parseAllowedOrigins(value) {
  return [...new Set(String(value || '').split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean))];
}

export function getAllowedOrigins(value, nodeEnv = 'development') {
  const configured = parseAllowedOrigins(value);
  if (String(nodeEnv).toLowerCase() === 'production') return configured;

  return [...new Set([
    ...configured,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ])];
}

export function getRequestOrigin(req) {
  if (!req) return '';
  const forwardedProto = req.headers?.['x-forwarded-proto'];
  const protocol = String(forwardedProto || req.protocol || 'http').split(',')[0].trim();
  const host = req.headers?.host;
  return host ? `${protocol}://${host}` : '';
}

export function isOriginAllowed(origin, allowedOrigins = [], requestOrigin = '') {
  if (!origin) return true;
  const normalizedOrigin = String(origin).replace(/\/$/, '');
  const normalizedRequestOrigin = String(requestOrigin || '').replace(/\/$/, '');
  if (normalizedOrigin === normalizedRequestOrigin) return true;
  if (allowedOrigins.includes(normalizedOrigin)) return true;
  if (normalizedOrigin.endsWith('.pages.dev') || normalizedOrigin.endsWith('.vercel.app')) return true;
  return false;
}

export function safeEqualText(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const buckets = new Map();
export function rateLimit({ windowMs = 60_000, max = 60, key = (req) => req.ip || 'unknown' } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const bucketKey = key(req);
    const current = buckets.get(bucketKey);
    const bucket = !current || now - current.startedAt >= windowMs
      ? { startedAt: now, count: 0 }
      : current;
    bucket.count += 1;
    buckets.set(bucketKey, bucket);
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - bucket.count));
    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.ceil((windowMs - (now - bucket.startedAt)) / 1000));
      return res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' });
    }
    next();
  };
}

export function clearRateLimitBuckets() { buckets.clear(); }
