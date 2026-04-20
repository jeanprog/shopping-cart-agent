import { z } from "zod";

/** Login e cadastro no mesmo formulário — validação por modo (Zod discriminated union). */
export const authFormSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("login"),
    email: z.string().email("E-mail inválido").max(320),
    password: z.string().min(1, "Informe a senha").max(128),
  }),
  z.object({
    mode: z.literal("register"),
    email: z.string().email("E-mail inválido").max(320),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .max(128),
  }),
]);

export type AuthFormInput = z.infer<typeof authFormSchema>;
