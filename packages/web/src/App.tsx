import React, { useEffect, useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { AddressOnboardingPage } from "./pages/AddressOnboardingPage";
import { useChatStore } from "./store/chatStore";
import {
  fetchMe,
  loginWithEmailPassword,
  loginWithGoogle,
  registerWithEmailPassword,
} from "./services/authApi";
import type { AuthFormInput } from "./schemas/authForms";

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();

export const App = () => {
  const {
    token,
    user,
    setAuth,
    setUser,
    setLoading,
    isLoading,
  } = useChatStore();
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setProfileReady(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const me = await fetchMe(token);
        if (!cancelled) {
          setUser({
            id: me.id,
            email: me.email,
            name: me.name,
            avatarUrl: me.avatarUrl,
            onboardingCompleted: me.onboardingCompleted,
          });
        }
      } catch {
        if (!cancelled) {
          useChatStore.getState().logout();
        }
      } finally {
        if (!cancelled) setProfileReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, setUser]);

  const handleCredentials = async (data: AuthFormInput) => {
    setLoading(true);
    try {
      const { token: t, user: u } =
        data.mode === "register"
          ? await registerWithEmailPassword(data.email, data.password)
          : await loginWithEmailPassword(data.email, data.password);
      setAuth(t, {
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl,
        onboardingCompleted: u.onboardingCompleted,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setLoading(true);
    try {
      const { token: t, user: u } = await loginWithGoogle(credential);
      setAuth(t, {
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl,
        onboardingCompleted: u.onboardingCompleted,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha no login Google");
    } finally {
      setLoading(false);
    }
  };

  const refreshUserAfterOnboarding = async () => {
    if (!token) return;
    const me = await fetchMe(token);
    setUser({
      id: me.id,
      email: me.email,
      name: me.name,
      avatarUrl: me.avatarUrl,
      onboardingCompleted: me.onboardingCompleted,
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark p-4">
        <LoginPage
          googleClientId={googleClientId}
          onCredentialsSubmit={handleCredentials}
          onGoogleCredential={handleGoogleCredential}
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (!profileReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark text-brand-muted">
        Carregando perfil…
      </div>
    );
  }

  const needsAddressOnboarding = user?.onboardingCompleted === false;

  if (needsAddressOnboarding) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030406] p-4">
        <AddressOnboardingPage
          token={token}
          onComplete={async () => {
            await refreshUserAfterOnboarding();
          }}
          onSkip={async () => {
            await refreshUserAfterOnboarding();
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-dvh min-h-0 w-full overflow-hidden bg-brand-dark flex justify-center items-stretch box-border p-4 lg:p-8">
      <ChatPage />
    </div>
  );
};

export default App;
