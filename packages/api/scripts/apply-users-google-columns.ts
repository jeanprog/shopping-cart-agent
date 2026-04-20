/**
 * Aplica colunas OAuth em `users` quando o schema Drizzle já foi atualizado
 * mas o Postgres não (erro: coluna "google_sub" não existe).
 */
import "dotenv/config";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(__dirname, "add-users-google-oauth-columns.sql"),
  "utf8",
);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não definida no .env da API.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });
try {
  await pool.query(sql);
  console.log(
    'OK: colunas OAuth (google_sub, name, avatar_url, onboarding_completed) e password_hash nullable em "users".',
  );
} finally {
  await pool.end();
}
