import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(5000),
});

export const registerBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

export function formatZodError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Dados inválidos";
}
