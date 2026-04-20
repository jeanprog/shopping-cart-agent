import { API_BASE_URL } from "../config/apiBase";

const API_URL = API_BASE_URL;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
  error?: string;
}

type ApiErrorBody = { error?: string; details?: string };

function errorMessageFromBody(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const o = data as ApiErrorBody;
    const parts = [o.error, o.details].filter(
      (x): x is string => typeof x === "string" && x.length > 0,
    );
    if (parts.length > 0) return parts.join(" — ");
  }
  return `HTTP ${status}`;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & ApiErrorBody;
  if (!res.ok) {
    throw new Error(errorMessageFromBody(data, res.status));
  }
  return data as T;
}

export const api = {
  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${endpoint}`, { headers });
    return parseJsonResponse<T>(res);
  },

  async post<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    return parseJsonResponse<T>(res);
  },

  async patch<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    return parseJsonResponse<T>(res);
  },

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return parseJsonResponse<T>(res);
  },
};
