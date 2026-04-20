import { z } from "zod";

export const settingsAddressFormSchema = z.object({
  label: z.string().min(1, "Rótulo obrigatório"),
  cep: z.string(),
  street: z.string().min(1, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string(),
  district: z.string(),
  city: z.string().min(1, "Cidade obrigatória"),
  state: z
    .string()
    .min(1, "UF obrigatória")
    .max(2, "Use 2 letras")
    .transform((s) => s.trim().toUpperCase()),
});

export type SettingsAddressFormValues = z.infer<typeof settingsAddressFormSchema>;
