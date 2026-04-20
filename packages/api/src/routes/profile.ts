import { Router } from "express";
import { authenticate, type AuthRequest } from "../auth";

export const profileRouter = Router();

profileRouter.get("/profile", authenticate, (req: AuthRequest, res) => {
  res.json({ message: "Este é um perfil protegido", userId: req.userId });
});
