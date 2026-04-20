import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  welcomeEmailFormSchema,
  type WelcomeEmailFormValues,
} from "@/schemas/welcomeEmailForm";

export const WelcomePage: React.FC<{
  onContinue: (email: string) => void;
}> = ({ onContinue }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WelcomeEmailFormValues>({
    resolver: zodResolver(welcomeEmailFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((data) => onContinue(data.email.trim()));

  return (
    <main
      id="auth-container"
      className="w-full max-w-[1440px] min-h-[1024px] mx-auto flex flex-col lg:flex-row relative overflow-hidden bg-brand-dark shadow-2xl rounded-[32px] m-4 lg:m-8 border border-gray-800"
    >
      {/* Left Section: Branding & Visuals */}
      <section
        id="branding-hero"
        className="w-full lg:w-1/2 relative bg-brand-gray overflow-hidden flex flex-col justify-between p-12 lg:p-20 border-r border-gray-800"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grad)" />
            <defs>
              <linearGradient
                id="grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#7BB3D1"
                  stopOpacity="0.5"
                />
                <stop
                  offset="100%"
                  stopColor="#070A0E"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-glow">
              <i className="fa-solid fa-bag-shopping text-brand-dark text-xl"></i>
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
            Converse, descubra e compre. Encontre exatamente o que você procura
            apenas digitando.
          </p>
        </div>

        {/* Image Composition representing the AI shopping experience */}
        <div className="relative z-10 mt-12 flex-grow flex items-end justify-center w-full h-full min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-gray via-transparent to-transparent z-20"></div>
          <img
            className="w-full h-full object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-700 opacity-90"
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/ce79eff6d3-deaffe5e7f5009eb7c72.png"
            alt="High fashion editorial style photo"
          />

          {/* Floating UI Elements */}
          <div className="absolute top-1/4 right-8 z-30 glass-panel px-4 py-3 rounded-2xl shadow-soft transform rotate-3 animate-pulse border border-gray-700/50">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <i className="fa-solid fa-sparkles text-brand-blue drop-shadow-[0_0_8px_rgba(123,179,209,0.8)]"></i>{" "}
              Encontrado!
            </p>
          </div>
          <div className="absolute bottom-1/4 left-8 z-30 glass-panel px-5 py-3 rounded-2xl shadow-soft transform -rotate-2 border border-gray-700/50">
            <p className="text-sm font-medium text-white">
              Qual o seu tamanho?
            </p>
          </div>
        </div>
      </section>

      {/* Right Section: Auth & Interaction */}
      <section
        id="auth-actions"
        className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 py-12 relative bg-brand-dark"
      >
        <div className="max-w-md w-full mx-auto space-y-10 relative z-10">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Bem-vindo(a)
            </h2>
            <p className="text-brand-muted text-lg">
              Como você gostaria de começar hoje?
            </p>
          </div>

          {/* Suggestion Chips Preview */}
          <div id="suggestion-chips" className="space-y-4">
            <p className="text-sm font-medium text-brand-muted uppercase tracking-wider text-center">
              Experimente perguntar
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-full border border-gray-700 bg-brand-gray text-brand-text text-sm font-medium hover:border-brand-blue hover:shadow-glow transition-all duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-magnifying-glass text-brand-muted text-xs"></i>
                Onde encontro um tênis azul?
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-full border border-gray-700 bg-brand-gray text-brand-text text-sm font-medium hover:border-brand-blue hover:shadow-glow transition-all duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-magnifying-glass text-brand-muted text-xs"></i>
                Melhor preço para iPhone
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-full border border-gray-700 bg-brand-gray text-brand-text text-sm font-medium hover:border-brand-blue hover:shadow-glow transition-all duration-200 flex items-center gap-2 hidden sm:flex"
              >
                <i className="fa-solid fa-magnifying-glass text-brand-muted text-xs"></i>
                Presente para dia das mães
              </button>
            </div>
          </div>

          {/* Auth Form / CTAs */}
          <form className="space-y-4 pt-6" onSubmit={onSubmit} noValidate>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-regular fa-envelope text-brand-muted"></i>
              </div>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="Digite seu e-mail para começar..."
                className="w-full pl-11 pr-32 py-4 bg-brand-gray border border-gray-700 rounded-2xl text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all duration-200 text-base shadow-inner"
              />
              <button
                type="submit"
                className="absolute inset-y-2 right-2 px-6 bg-brand-yellow text-brand-dark font-bold rounded-xl hover:bg-[#d4ed3e] transition-colors shadow-[0_0_15px_rgba(230,255,85,0.3)] flex items-center gap-2"
              >
                Continuar <i className="fa-solid fa-arrow-right text-sm"></i>
              </button>
            </div>
            {errors.email && (
              <p className="text-sm text-red-400 px-1">{errors.email.message}</p>
            )}

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink-0 mx-4 text-brand-muted text-sm font-medium">
                ou
              </span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            <button
              type="button"
              className="w-full py-4 rounded-2xl border border-gray-700 bg-brand-gray text-white font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:border-gray-600"
            >
              <i className="fa-brands fa-google text-lg"></i>
              Continuar com Google
            </button>

            <button
              type="button"
              className="w-full py-4 rounded-2xl border border-gray-700 bg-brand-gray text-white font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:border-gray-600"
            >
              <i className="fa-brands fa-apple text-lg"></i>
              Continuar com Apple
            </button>
          </form>

          {/* Guest CTA */}
          <div className="text-center pt-4">
            <button
              type="button"
              className="text-brand-muted hover:text-white font-medium underline decoration-gray-700 underline-offset-4 transition-colors"
            >
              Continuar como convidado
            </button>
          </div>
        </div>

        {/* Bottom utility bar */}
        <div
          id="user-preferences"
          className="absolute bottom-8 left-0 w-full px-8 lg:px-24 flex justify-between items-center z-10"
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-sm text-brand-muted hover:text-white font-medium flex items-center gap-2 transition-colors"
            >
              <i className="fa-solid fa-globe"></i> PT-BR
            </button>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <button
              type="button"
              className="text-sm text-brand-muted hover:text-white font-medium flex items-center gap-2 transition-colors"
            >
              <i className="fa-solid fa-coins"></i> BRL (R$)
            </button>
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-sm text-brand-muted hover:text-white transition-colors"
            >
              Termos
            </a>
            <a
              href="#"
              className="text-sm text-brand-muted hover:text-white transition-colors"
            >
              Privacidade
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
