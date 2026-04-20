import { Router } from "express";
import { db } from "../db/index";
import { products } from "../db/schema";
import { executeProductSearch } from "../agent/shopping-tools";

export const productsRouter = Router();

productsRouter.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    const result = await executeProductSearch(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

productsRouter.get("/", async (_req, res) => {
  const allProducts = await db.select().from(products).limit(50);
  res.json(allProducts);
});
