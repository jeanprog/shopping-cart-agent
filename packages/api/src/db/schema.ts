import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';

/** Passos da timeline (JSON em `orders.timeline`) */
export type OrderTimelineJson = {
  id: string;
  label: string;
  time: string;
  state: 'done' | 'current' | 'pending';
  icon: 'check' | 'truck' | 'dot';
}[];

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  /** Null quando a conta é só OAuth (Google). */
  passwordHash: text('password_hash'),
  googleSub: text('google_sub').unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userAddresses = pgTable('user_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  label: text('label').notNull(),
  cep: text('cep'),
  street: text('street').notNull(),
  number: text('number').notNull(),
  complement: text('complement'),
  district: text('district'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  deliveryPreference: text('delivery_preference', {
    enum: ['fast', 'economic'],
  })
    .default('economic')
    .notNull(),
  notifyOrderUpdates: boolean('notify_order_updates').default(true).notNull(),
  notifyPromos: boolean('notify_promos').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // em centavos
  stock: integer('stock').default(0).notNull(),
  brand: text('brand'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: text('status', { enum: ['active', 'completed'] }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').references(() => carts.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  /** Snapshot opcional do endereço usado na compra */
  addressId: uuid('address_id').references(() => userAddresses.id),
  orderCode: text('order_code').notNull().unique(),
  status: text('status', {
    enum: ['preparing', 'transit', 'delivered', 'cancelled'],
  }).notNull(),
  statusLabel: text('status_label').notNull(),
  totalCents: integer('total_cents').notNull(),
  /** Título na lista (ex.: "Produto A + Produto B") */
  summaryTitle: text('summary_title').notNull(),
  dateLabel: text('date_label').notNull(),
  dateValue: text('date_value').notNull(),
  addressTitle: text('address_title').notNull(),
  addressLines: text('address_lines').notNull(),
  kpiEstimated: text('kpi_estimated'),
  kpiDistance: text('kpi_distance'),
  timelineProgressPct: integer('timeline_progress_pct').default(0).notNull(),
  timeline: jsonb('timeline').$type<OrderTimelineJson>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at'),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productId: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  productName: text('product_name').notNull(),
  brand: text('brand'),
  imageUrl: text('image_url'),
  /** Ex.: variantes exibidas no checkout */
  lineSubtitle: text('line_subtitle'),
});
