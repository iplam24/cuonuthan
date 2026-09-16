import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return null;
  }
}
