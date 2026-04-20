import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

console.log('🔄 Conectando ao PostgreSQL local...');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do Postgres:', err);
});

export const db = drizzle(pool, { schema });

console.log('✅ Conexão com o banco de dados configurada.');

