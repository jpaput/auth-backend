import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; // remplace en prod


export function signJwt(payload: object, expiresIn: string = '7d') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
  }
  
  export function verifyJwt(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  export function generateRefreshToken(): string {
    return randomBytes(40).toString('hex'); // 80 char
  }