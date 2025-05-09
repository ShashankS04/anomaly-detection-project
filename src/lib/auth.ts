import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

export interface User {
  id: string;
  email: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): User | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch {
    return null;
  }
};

export const signUp = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const hashedPassword = await hashPassword(password);
  const result = await db.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
    [email, hashedPassword]
  );
  
  const user = result.rows[0];
  const token = generateToken(user);
  
  return { user, token };
};

export const signIn = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  
  if (!user || !(await comparePasswords(password, user.password))) {
    throw new Error('Invalid email or password');
  }
  
  const token = generateToken(user);
  return { user: { id: user.id, email: user.email }, token };
};