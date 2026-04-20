import { z } from "zod";

export const onboardingStep1FormSchema = z.object({
  categoryIds: z
    .array(z.string())
    .min(1, "Escolha ao menos uma categoria favorita"),
  priceTier: z.enum(["budget", "mid", "premium"]),
  restrictionTags: z.array(z.string()),
});

export type OnboardingStep1FormValues = z.infer<
  typeof onboardingStep1FormSchema
>;
