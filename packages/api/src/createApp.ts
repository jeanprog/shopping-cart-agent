import express, { type Express } from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { chatRouter } from "./routes/chat";
import { cartRouter, checkoutRouter } from "./routes/cart";
import { addressesRouter } from "./routes/addresses";
import { ordersRouter } from "./routes/orders";
import { productsRouter } from "./routes/products";
import { profileRouter } from "./routes/profile";

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("⚠️ OPENROUTER_API_KEY não configurada no .env");
  }

  app.use("/api/auth", authRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/checkout", checkoutRouter);
  app.use("/api/addresses", addressesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/me", profileRouter);

  return app;
}
