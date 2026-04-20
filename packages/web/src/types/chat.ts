/** Alinhado ao JSON retornado por POST /api/chat */
export interface ChatProductPreview {
  id: string;
  name: string;
  brand: string | null;
  priceCents: number;
  imageUrl: string | null;
}
