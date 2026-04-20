/** Conteúdo estático do onboarding (preferências) — sem UI. */

export const ONBOARDING_CATEGORY_OPTIONS = [
  { id: "Moda Casual", icon: "fa-shirt" },
  { id: "Calçados", icon: "fa-shoe-prints" },
  { id: "Eletrônicos", icon: "fa-laptop" },
  { id: "Casa & Decoração", icon: "fa-house-chimney" },
  { id: "Esportes", icon: "fa-dumbbell" },
  { id: "Beleza", icon: "fa-pump-soap" },
] as const;

export type OnboardingCategoryId =
  (typeof ONBOARDING_CATEGORY_OPTIONS)[number]["id"];

export const ONBOARDING_PRICE_LABELS = [
  "$ Econômico",
  "$$ Médio",
  "$$ Premium",
] as const;

export type OnboardingPriceTier = "budget" | "mid" | "premium";

export function priceTierFromRadioLabel(
  label: string,
): OnboardingPriceTier {
  if (label === ONBOARDING_PRICE_LABELS[0]) return "budget";
  if (label === ONBOARDING_PRICE_LABELS[2]) return "premium";
  return "mid";
}

export function radioLabelFromPriceTier(tier: OnboardingPriceTier): string {
  const map: Record<OnboardingPriceTier, string> = {
    budget: ONBOARDING_PRICE_LABELS[0],
    mid: ONBOARDING_PRICE_LABELS[1],
    premium: ONBOARDING_PRICE_LABELS[2],
  };
  return map[tier];
}

export const ONBOARDING_RESTRICTION_OPTIONS = [
  "Vegano",
  "Sustentável",
  "Sem Glúten",
] as const;

export function toggleIdInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
