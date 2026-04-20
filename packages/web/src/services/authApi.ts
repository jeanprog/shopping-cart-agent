import { api } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  onboardingCompleted: boolean;
};

export async function loginWithGoogle(credential: string): Promise<{
  token: string;
  user: AuthUser;
}> {
  const data = await api.post<{
    token: string;
    user: AuthUser;
    error?: string;
  }>("/api/auth/google", { credential });
  if (!data.token || !data.user) {
    throw new Error(data.error ?? "Falha no login com Google");
  }
  return { token: data.token, user: data.user };
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  const data = await api.post<{
    token: string;
    user: AuthUser;
    error?: string;
  }>("/api/auth/login", { email, password });
  if (!data.token || !data.user) {
    throw new Error(data.error ?? "Credenciais inválidas");
  }
  return { token: data.token, user: data.user };
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  const data = await api.post<{
    token: string;
    user: AuthUser;
    error?: string;
  }>("/api/auth/register", { email, password });
  if (!data.token || !data.user) {
    throw new Error(data.error ?? "Não foi possível criar a conta");
  }
  return { token: data.token, user: data.user };
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return api.get<AuthUser>("/api/auth/me", token);
}

export async function patchOnboardingComplete(
  token: string,
  onboardingCompleted: boolean,
): Promise<AuthUser> {
  return api.patch<AuthUser>(
    "/api/auth/me",
    { onboardingCompleted },
    token,
  );
}
