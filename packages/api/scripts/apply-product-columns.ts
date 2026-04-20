/**
 * Aplica colunas faltantes em `products` quando o schema Drizzle já foi atualizado
 * mas o Postgres não (erro: coluna "brand" não existe).
 */
import "dotenv/config";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(__dirname, "add-product-brand-image-url.sql"),
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
  console.log('OK: colunas "brand" e "image_url" garantidas em "products".');
} finally {
  await pool.end();
}
