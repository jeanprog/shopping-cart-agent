import { z } from "zod";

export const welcomeEmailFormSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
});

export type WelcomeEmailFormValues = z.infer<typeof welcomeEmailFormSchema>;
