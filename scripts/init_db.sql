-- Script para inicialização do Banco de Dados Local (PostgreSQL)

-- 1. Criar o banco de dados (Opcional se você já tiver o bando criado)
-- CREATE DATABASE shopping_cart;

-- Conecte-se ao banco shopping_cart antes de rodar os comandos abaixo

-- Habilitar extensão para UUID se necessário (embora gen_random_uuid() já venha nativo no PG 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Esquema conforme definido no Drizzle ORM

CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" text NOT NULL UNIQUE,
    "password_hash" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "description" text,
    "price" integer NOT NULL, -- preço em centavos
    "stock" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "carts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "status" text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed')),
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "cart_id" uuid NOT NULL REFERENCES "carts"("id"),
    "product_id" uuid NOT NULL REFERENCES "products"("id"),
    "quantity" integer NOT NULL
);

-- 3. Dados Fake (Seed)

-- Usuário de teste (senha: 'senha123')
INSERT INTO "users" (email, password_hash) 
VALUES ('teste@example.com', '$2b$10$EPf9rv73SDRXOf8/XW0XEuTz.K7i9K1F8i6VpBvVf8gH9W7vH8m.G')
ON CONFLICT (email) DO NOTHING;

-- Produtos do catálogo
INSERT INTO "products" (name, description, price, stock) VALUES
('AI Assistant Pro', 'O assistente inteligente definitivo para sua produtividade.', 9900, 50),
('Smart Shopping Cart Sensor', 'Sensor avançado para detecção automática de itens.', 4500, 100),
('Cloud Backend Suite', 'Infraestrutura completa para sua loja virtual.', 15000, 20),
('Next-Gen Keyboard', 'Teclado mecânico otimizado para desenvolvedores.', 8500, 30),
('Ultra-Wide Monitor', 'Monitor 4K para máxima visibilidade de código.', 29900, 15)
ON CONFLICT DO NOTHING;

-- Exemplo de Carrinho Ativo para o usuário de teste
INSERT INTO "carts" (user_id, status)
SELECT id, 'active' FROM "users" WHERE email = 'teste@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Adicionando itens ao carrinho
INSERT INTO "cart_items" (cart_id, product_id, quantity)
SELECT c.id, p.id, 2
FROM "carts" c, "products" p
WHERE c.status = 'active' AND p.name = 'AI Assistant Pro'
LIMIT 1
ON CONFLICT DO NOTHING;
