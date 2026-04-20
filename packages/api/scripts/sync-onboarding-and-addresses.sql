-- Sincroniza Postgres com packages/api/src/db/schema.ts para:
-- - users: OAuth (google_sub, name, avatar_url), onboarding_completed, password_hash nullable
-- - user_addresses: tabela completa (onboarding + configurações de entrega)
-- - orders.address_id: FK opcional para user_addresses
--
-- Seguro para rodar várias vezes (idempotente onde o Postgres permite).

-- ========== 1) users ==========
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_sub" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false;
UPDATE "users" SET "onboarding_completed" = false WHERE "onboarding_completed" IS NULL;
ALTER TABLE "users" ALTER COLUMN "onboarding_completed" SET DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "onboarding_completed" SET NOT NULL;

ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_google_sub_unique" ON "users" ("google_sub");

-- ========== 2) user_addresses ==========
CREATE TABLE IF NOT EXISTS "user_addresses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "label" text NOT NULL,
  "cep" text,
  "street" text NOT NULL,
  "number" text NOT NULL,
  "complement" text,
  "district" text,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "delivery_preference" text DEFAULT 'economic' NOT NULL,
  "notify_order_updates" boolean DEFAULT true NOT NULL,
  "notify_promos" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_addresses_user_id_idx" ON "user_addresses" ("user_id");

DO $$
BEGIN
  ALTER TABLE "user_addresses"
    ADD CONSTRAINT "user_addresses_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========== 3) orders.address_id ==========
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "address_id" uuid;

DO $$
BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "orders_address_id_user_addresses_id_fk"
    FOREIGN KEY ("address_id") REFERENCES "public"."user_addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
