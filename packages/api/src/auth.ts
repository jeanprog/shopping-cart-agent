import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import { db } from './db/index';
import { users } from './db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_não_use_em_produção';
const EXPIRES_IN = '24h';

/** Token usado pelo front quando o login é só mockado (sem /api/auth). */
export const MOCK_FRONTEND_SESSION_TOKEN = 'mock-shopai-session';

export interface AuthRequest extends Request {
  userId?: string;
}

// Utilitários de Hash
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Utilitários de Token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: EXPIRES_IN });
};

// Middleware de Autenticação
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  if (token === MOCK_FRONTEND_SESSION_TOKEN) {
    try {
      const [row] = await db.select({ id: users.id }).from(users).limit(1);
      if (!row) {
        return res.status(401).json({
          error:
            'Login mock: nenhum usuário no banco. Execute o seed da API (pnpm seed / npm run seed).',
        });
      }
      req.userId = row.id;
      return next();
    } catch (error) {
      console.error('Mock auth error:', error);
      return res.status(500).json({ error: 'Falha na autenticação mock' });
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
