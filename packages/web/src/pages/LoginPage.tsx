import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { cn } from "@/lib/utils";
import { authFormSchema, type AuthFormInput } from "@/schemas/authForms";

export type LoginPageProps = {
  googleClientId?: string;
  onCredentialsSubmit: (data: AuthFormInput) => Promise<void>;
  onGoogleCredential: (credential: string) => Promise<void>;
  isLoading?: boolean;
};

export const LoginPage: React.FC<LoginPageProps> = ({
  googleClientId,
  onCredentialsSubmit,
  onGoogleCredential,
  isLoading = false,
}) => {
  const useRealGoogle = Boolean(googleClientId?.trim());

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<AuthFormInput>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      mode: "login",
      email: "",
      password: "",
    },
  });

  const mode = watch("mode");

  const switchMode = (next: "login" | "register") => {
    setValue("mode", next, { shouldValidate: false });
    setValue("password", "");
    clearErrors();
  };

  return (
    <main
      id="auth-container"
      className="w-full max-w-[1440px] min-h-[1024px] mx-auto flex flex-col lg:flex-row relative overflow-hidden bg-brand-dark shadow-2xl rounded-[32px] m-4 lg:m-8 border border-white/[0.08]"
    >
      <section
        id="branding-hero"
        className="w-full lg:w-1/2 relative bg-[#050505] overflow-hidden flex flex-col justify-between p-12 lg:p-20 border-r border-white/[0.08]"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#050505" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-[0_4px_24px_-4px_rgba(123,179,209,0.3)]">
              <i className="fa-solid fa-bag-shopping text-[#050505] text-xl" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              ShopAI
            </span>
          </div>

          <h1 className="text-white text-5xl lg:text-[64px] font-extrabold leading-[1.1] mb-6 tracking-tight">
            Seu assistente
            <br />
            de compras.
          </h1>
          <p className="text-brand-muted text-xl max-w-md font-medium leading-relaxed">
            Entre com e-mail e senha ou Google — sua sessão vem da API.
          </p>
        </div>

        <div className="relative z-10 mt-12 flex-grow flex items-end justify-center w-full h-full min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-20" />
          <img
            className="w-full h-full object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-luminosity"
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/ce79eff6d3-c14071a4b9742f02b5c1.png"
            alt=""
          />
        </div>
      </section>

      <section
        id="auth-actions"
        className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 py-12 relative bg-brand-dark"
      >
        <form
          className="max-w-md w-full mx-auto space-y-8 relative z-10"
          onSubmit={handleSubmit(async (data) => {
            await onCredentialsSubmit(data);
          })}
          noValidate
        >
          <input type="hidden" {...register("mode")} />

          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {mode === "login" ? "Bem-vindo(a)" : "Criar conta"}
            </h2>
            <p className="text-brand-muted text-lg">
              {mode === "login"
                ? "Acesse com a conta cadastrada na API."
                : "Cadastre e-mail e senha (mín. 8 caracteres)."}
            </p>
          </div>

          <div className="flex rounded-2xl border border-white/10 p-1 bg-brand-gray/50">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors",
                mode === "login"
                  ? "bg-brand-blue text-[#050505]"
                  : "text-brand-muted hover:text-white",
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors",
                mode === "register"
                  ? "bg-brand-blue text-[#050505]"
                  : "text-brand-muted hover:text-white",
              )}
            >
              Cadastrar
            </button>
          </div>

          <div className="space-y-4 pt-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-regular fa-envelope text-brand-muted" />
              </div>
              <input
                type="email"
                autoComplete="email"
                disabled={isLoading}
                className={cn(
                  "w-full pl-11 pr-4 py-3.5 bg-brand-gray border rounded-2xl text-white placeholder:text-brand-muted focus:outline-none focus:ring-1 text-base shadow-inner",
                  errors.email
                    ? "border-red-500/60 focus:ring-red-500/40"
                    : "border-white/[0.08] focus:ring-white/20",
                )}
                placeholder="E-mail"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-lock text-brand-muted" />
              </div>
              <input
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                disabled={isLoading}
                className={cn(
                  "w-full pl-11 pr-4 py-3.5 bg-brand-gray border rounded-2xl text-white placeholder:text-brand-muted focus:outline-none focus:ring-1 text-base shadow-inner",
                  errors.password
                    ? "border-red-500/60 focus:ring-red-500/40"
                    : "border-white/[0.08] focus:ring-white/20",
                )}
                placeholder={
                  mode === "register"
                    ? "Senha (mín. 8 caracteres)"
                    : "Senha"
                }
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-brand-blue text-[#050505] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {mode === "login" ? "Entrar com e-mail e senha" : "Criar conta"}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/[0.08]" />
              <span className="flex-shrink-0 mx-4 text-brand-muted text-sm font-medium">
                ou
              </span>
              <div className="flex-grow border-t border-white/[0.08]" />
            </div>

            {useRealGoogle ? (
              <div className="space-y-3">
                <div className="flex justify-center w-full max-w-md mx-auto [&_iframe]:!w-full">
                  <GoogleLogin
                    onSuccess={(cred) => {
                      if (cred.credential) void onGoogleCredential(cred.credential);
                    }}
                    onError={() => {
                      alert("Falha no login Google");
                    }}
                    useOneTap={false}
                    theme="filled_black"
                    size="large"
                    text="continue_with"
                    width={400}
                  />
                </div>
                {import.meta.env.DEV && (
                  <div className="text-[11px] text-brand-muted text-left leading-relaxed px-1 space-y-2 border border-white/10 rounded-xl p-3 bg-white/[0.03]">
                    <p>
                      <strong className="text-brand-text/80">origin_mismatch</strong> ou{" "}
                      <strong className="text-brand-text/80">
                        401 invalid_client / no registered origin
                      </strong>
                      : no{" "}
                      <a
                        className="text-brand-blue underline"
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Google Cloud → Credenciais
                      </a>
                      , use o mesmo ID que em{" "}
                      <code className="text-brand-blue">VITE_GOOGLE_CLIENT_ID</code> e autorize{" "}
                      <code className="text-brand-blue break-all">
                        http://localhost:5173
                      </code>
                      .
                    </p>
                    <p>
                      Origem atual:{" "}
                      <code className="text-brand-blue break-all">
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : "—"}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-brand-muted border border-white/10 rounded-xl p-4 bg-white/[0.02]">
                Para login com Google, defina{" "}
                <code className="text-brand-blue">VITE_GOOGLE_CLIENT_ID</code> no{" "}
                <code className="text-brand-blue">packages/web/.env</code> (igual ao{" "}
                <code className="text-brand-blue">GOOGLE_CLIENT_ID</code> da API) e reinicie o Vite.
              </p>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};
