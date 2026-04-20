import { z } from "zod";

/** Espelha a validação anterior: rua, número, cidade e UF obrigatórios (após trim). */
export const addressOnboardingFormSchema = z
  .object({
    label: z.string(),
    cep: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string(),
    district: z.string(),
    city: z.string(),
    stateUf: z.string(),
    deliveryPref: z.enum(["fast", "economic"]),
    notifyOrders: z.boolean(),
    notifyPromos: z.boolean(),
  })
  .refine(
    (d) =>
      d.street.trim().length > 0 &&
      d.number.trim().length > 0 &&
      d.city.trim().length > 0 &&
      d.stateUf.trim().length > 0,
    { message: "Preencha rua, número, cidade e UF.", path: ["street"] },
  );

export type AddressOnboardingFormInput = z.infer<
  typeof addressOnboardingFormSchema
>;
