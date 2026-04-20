-- Alinha `users` ao schema Drizzle quando o banco ainda é o da migration 0000
-- (erro: coluna "google_sub" não existe).

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_sub" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false;
UPDATE "users" SET "onboarding_completed" = false WHERE "onboarding_completed" IS NULL;
ALTER TABLE "users" ALTER COLUMN "onboarding_completed" SET DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "onboarding_completed" SET NOT NULL;

ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_google_sub_unique" ON "users" ("google_sub");
