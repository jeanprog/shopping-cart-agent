-- Sincroniza com packages/api/src/db/schema.ts (colunas brand + image_url)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image_url" text;
