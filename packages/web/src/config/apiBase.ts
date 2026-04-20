/** Base URL da API (dev: http://localhost:3001). Sobrescreva com `VITE_API_URL`. */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  "http://localhost:3001";
