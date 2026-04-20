/**
 * Aplica schema de onboarding + endereços quando o Drizzle foi atualizado
 * mas o Postgres não (ex.: relação "user_addresses" não existe).
 *
 * Equivale a alinhar users, user_addresses e orders.address_id com src/db/schema.ts.
 */
import "dotenv/config";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(__dirname, "sync-onboarding-and-addresses.sql"),
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
    'OK: schema de onboarding/endereços aplicado (users OAuth, "user_addresses", "orders.address_id").',
  );
} finally {
  await pool.end();
}
