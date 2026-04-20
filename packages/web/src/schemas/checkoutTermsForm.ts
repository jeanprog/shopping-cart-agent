import { z } from "zod";

/** Checkout: aceite obrigatório dos termos antes de finalizar. */
export const checkoutTermsFormSchema = z.object({
  termsAccepted: z.boolean().refine((v) => v === true, {
    message: "Aceite os termos para continuar.",
  }),
});

export type CheckoutTermsFormValues = z.infer<typeof checkoutTermsFormSchema>;
