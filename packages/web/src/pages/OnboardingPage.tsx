import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  ONBOARDING_CATEGORY_OPTIONS,
  ONBOARDING_RESTRICTION_OPTIONS,
  radioLabelFromPriceTier,
  toggleIdInList,
  type OnboardingPriceTier,
} from "@/domain/onboardingCatalog";
import {
  onboardingStep1FormSchema,
  type OnboardingStep1FormValues,
} from "@/schemas/onboardingStep1Form";

const STEP1_DEFAULTS: OnboardingStep1FormValues = {
  categoryIds: ["Moda Casual", "Casa & Decoração"],
  priceTier: "mid",
  restrictionTags: [],
};

const PRICE_TIERS: OnboardingPriceTier[] = ["budget", "mid", "premium"];

export const OnboardingPage: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(1);

  const {
    watch,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingStep1FormValues>({
    resolver: zodResolver(onboardingStep1FormSchema),
    defaultValues: STEP1_DEFAULTS,
  });

  const categoryIds = watch("categoryIds");
  const restrictionTags = watch("restrictionTags");

  const onContinueStep1 = handleSubmit(() => setStep(2));

  if (step === 1) {
    return (
      <main
        id="onboarding-container"
        className="w-full max-w-[1440px] min-h-[1024px] mx-auto flex flex-col relative overflow-hidden bg-brand-dark shadow-2xl rounded-[32px] m-4 lg:m-8 border border-gray-800"
      >
        <header className="w-full px-8 lg:px-16 pt-12 pb-6 flex justify-between items-center bg-brand-dark z-20 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-glow">
              <i className="fa-solid fa-bag-shopping text-brand-dark text-xl"></i>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              ShopAI
            </span>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-bold text-brand-text uppercase tracking-wider">
              Passo 1 de 2
            </span>
            <div className="flex gap-2">
              <div className="h-2 w-16 bg-brand-yellow rounded-full shadow-glow"></div>
              <div className="h-2 w-16 bg-gray-800 rounded-full"></div>
            </div>
          </div>
        </header>

        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
          <section className="w-full lg:w-1/3 bg-brand-gray p-8 lg:p-16 flex flex-col justify-center border-r border-gray-800 relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grad2)" />
                <defs>
                  <linearGradient
                    id="grad2"
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

            <div className="relative z-10 max-w-sm">
              <div className="w-16 h-16 bg-brand-dark rounded-2xl shadow-glow flex items-center justify-center mb-8 relative border border-gray-800">
                <i className="fa-solid fa-robot text-3xl text-brand-blue drop-shadow-[0_0_8px_rgba(123,179,209,0.8)]"></i>
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-yellow rounded-full border-2 border-brand-dark animate-bounce"></span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                Vamos personalizar
                <br />
                sua vitrine.
              </h1>
              <p className="text-lg text-brand-muted font-medium leading-relaxed mb-8">
                Para que eu possa te recomendar os melhores produtos logo de
                cara, me conte um pouco sobre o que você gosta.
              </p>
              <div className="glass-panel p-5 rounded-2xl shadow-soft">
                <p className="text-sm font-semibold text-brand-text flex items-start gap-3">
                  <i className="fa-solid fa-lightbulb text-brand-yellow mt-0.5 text-lg drop-shadow-[0_0_8px_rgba(230,255,85,0.6)]"></i>
                  Pode pular se quiser! Você sempre pode ajustar isso depois
                  conversando comigo.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full lg:w-2/3 p-8 lg:p-16 overflow-y-auto bg-brand-dark">
            <div className="max-w-3xl mx-auto space-y-12 pb-24">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-shapes text-brand-blue"></i>{" "}
                  Categorias Favoritas
                </h2>
                {errors.categoryIds && (
                  <p className="text-sm text-red-400 mb-3">
                    {errors.categoryIds.message}
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ONBOARDING_CATEGORY_OPTIONS.map((cat) => (
                    <label
                      key={cat.id}
                      onClick={() =>
                        setValue(
                          "categoryIds",
                          toggleIdInList(categoryIds, cat.id),
                          { shouldValidate: true },
                        )
                      }
                      className={cn(
                        "cursor-pointer border rounded-2xl p-5 flex flex-col items-center text-center gap-3 relative overflow-hidden group transition-all duration-300",
                        categoryIds.includes(cat.id)
                          ? "border-brand-yellow bg-brand-yellow/5 shadow-[0_0_0_1px_#E6FF55]"
                          : "border-gray-700 bg-brand-gray hover:border-brand-blue",
                      )}
                    >
                      <div className="absolute top-3 right-3">
                        <input
                          type="checkbox"
                          checked={categoryIds.includes(cat.id)}
                          readOnly
                          className="appearance-none w-5 h-5 border-[1.5px] border-gray-600 rounded bg-[#111827] checked:bg-brand-yellow checked:border-brand-yellow transition-all"
                        />
                      </div>
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform",
                          categoryIds.includes(cat.id)
                            ? "bg-brand-yellow/10 text-brand-yellow"
                            : "bg-gray-800 text-brand-muted",
                        )}
                      >
                        <i className={cn("fa-solid", cat.icon)}></i>
                      </div>
                      <span className="font-semibold text-brand-text">
                        {cat.id}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-tag text-brand-blue"></i> Faixa
                    de Preço
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {PRICE_TIERS.map((tier) => (
                      <label key={tier} className="cursor-pointer">
                        <input
                          type="radio"
                          value={tier}
                          className="peer sr-only"
                          {...register("priceTier")}
                        />
                        <div className="px-5 py-2.5 rounded-full border border-gray-700 bg-brand-gray text-brand-muted font-medium peer-checked:bg-brand-blue peer-checked:text-brand-dark peer-checked:border-brand-blue transition-colors hover:border-brand-blue">
                          {radioLabelFromPriceTier(tier)}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-leaf text-brand-blue"></i>{" "}
                    Restrições / Filtros
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {ONBOARDING_RESTRICTION_OPTIONS.map((label) => (
                      <label
                        key={label}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 bg-brand-gray hover:border-brand-blue transition-colors"
                        onClick={() =>
                          setValue(
                            "restrictionTags",
                            toggleIdInList(restrictionTags, label),
                            { shouldValidate: true },
                          )
                        }
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={restrictionTags.includes(label)}
                          className="appearance-none w-5 h-5 border-[1.5px] border-gray-600 rounded bg-[#111827] checked:bg-brand-blue checked:border-brand-blue transition-all"
                        />
                        <span className="text-sm font-semibold text-brand-text">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="absolute bottom-0 left-0 w-full glass-panel border-t border-gray-800 p-6 lg:px-16 z-30 flex justify-between items-center rounded-b-[32px]">
          <button
            type="button"
            className="text-brand-muted hover:text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i> Voltar
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              className="text-brand-muted hover:text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Pular
            </button>
            <button
              type="button"
              onClick={onContinueStep1}
              className="bg-brand-yellow text-brand-dark font-bold text-lg px-8 py-3 rounded-2xl hover:bg-[#d4ed3e] hover:shadow-[0_0_15px_rgba(230,255,85,0.3)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              Continuar <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </div>
        </footer>
      </main>
    );
  }

  // Step 2
  return (
    <main
      id="onboarding-container"
      className="w-full max-w-[1440px] min-h-[1024px] mx-auto flex flex-col relative overflow-hidden bg-[#0A0C10] shadow-2xl rounded-[32px] m-4 lg:m-8 border border-white/5"
    >
      <header className="w-full px-8 lg:px-16 pt-12 pb-6 flex justify-between items-center bg-[#0A0C10] z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#050505] rounded-xl flex items-center justify-center border border-white/10 shadow-soft">
            <i className="fa-solid fa-bag-shopping text-brand-blue text-xl"></i>
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">
            ShopAI
          </span>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-bold text-brand-text uppercase tracking-wider text-[#94A3B8]">
            Passo 2 de 2
          </span>
          <div className="flex gap-2">
            <div className="h-1.5 w-16 bg-white/10 rounded-full"></div>
            <div className="h-1.5 w-16 bg-brand-blue rounded-full shadow-[0_0_10px_rgba(123,179,209,0.3)]"></div>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        <section className="w-full lg:w-1/3 bg-[#050505] p-8 lg:p-16 flex flex-col justify-center border-r border-white/5 relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grad2)" />
              <defs>
                <linearGradient
                  id="grad2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#7BB3D1"
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="100%"
                    stopColor="#030406"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 max-w-sm">
            <div className="w-16 h-16 bg-[#0A0C10] rounded-2xl shadow-soft flex items-center justify-center mb-8 relative border border-white/10">
              <i className="fa-solid fa-truck-fast text-3xl text-brand-blue"></i>
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-blue rounded-full border-2 border-[#0A0C10] animate-pulse shadow-[0_0_10px_rgba(123,179,209,0.5)]"></span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Para onde enviamos?
            </h1>
            <p className="text-lg text-[#94A3B8] font-medium leading-relaxed mb-8">
              Quase lá! Informe seu CEP para calcularmos o frete e defina como
              prefere receber seus pedidos e novidades.
            </p>
            <div className="glass-panel p-5 rounded-2xl shadow-soft">
              <p className="text-sm font-semibold text-white flex items-start gap-3">
                <i className="fa-solid fa-shield-halved text-brand-blue mt-0.5 text-lg drop-shadow-[0_0_8px_rgba(123,179,209,0.3)]"></i>
                <span className="text-[#94A3B8]">
                  Seus dados estão seguros. Usamos apenas para logística e
                  comunicação essencial.
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="w-full lg:w-2/3 p-8 lg:p-16 overflow-y-auto bg-[#0A0C10]">
          <div className="max-w-3xl mx-auto space-y-12 pb-24">
            <div id="address-section" className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-map-location-dot text-brand-blue drop-shadow-[0_0_8px_rgba(123,179,209,0.3)]"></i>{" "}
                Local de Entrega
              </h2>
              <div className="bg-[#050505] p-6 rounded-[24px] border border-white/5 space-y-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fa-solid fa-magnifying-glass text-[#94A3B8]"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="Digite seu CEP (Ex: 01001-000)"
                      className="custom-input pl-12"
                      id="cep-input"
                    />
                  </div>
                  <button
                    type="button"
                    className="bg-brand-blue text-[#030406] font-semibold px-6 py-3 rounded-xl hover:bg-[#6aa2c0] transition-colors whitespace-nowrap flex items-center gap-2 justify-center shadow-[0_0_15px_rgba(123,179,209,0.2)]"
                  >
                    <i className="fa-solid fa-location-crosshairs"></i>{" "}
                    Auto-detectar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Rua / Avenida"
                      className="custom-input"
                      disabled
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Número"
                      className="custom-input"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            <div id="delivery-options-section" className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-box-open text-brand-blue drop-shadow-[0_0_8px_rgba(123,179,209,0.3)]"></i>{" "}
                Preferência de Entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    id: "rapida",
                    name: "Rápida",
                    desc: "Prioridade máxima. Receba seus produtos o mais rápido possível.",
                    icon: "fa-bolt",
                  },
                  {
                    id: "economica",
                    name: "Econômica",
                    desc: "Melhor custo-benefício. Entrega padrão com frete reduzido ou grátis.",
                    icon: "fa-piggy-bank",
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className="cursor-pointer border border-white/5 rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-brand-blue transition-all"
                  >
                    <div className="absolute top-6 right-6">
                      <input
                        type="radio"
                        name="delivery_pref"
                        className="peer sr-only"
                        defaultChecked={opt.id === "rapida"}
                      />
                      <div className="w-5 h-5 rounded-full border border-white/20 peer-checked:border-brand-blue flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-blue opacity-0 peer-checked:opacity-100 shadow-[0_0_8px_rgba(123,179,209,0.5)]"></div>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#050505] text-brand-blue flex items-center justify-center text-xl border border-white/5 group-hover:scale-110 transition-transform">
                      <i
                        className={cn(
                          "fa-solid",
                          opt.icon,
                          "drop-shadow-[0_0_8px_rgba(123,179,209,0.3)]",
                        )}
                      ></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">
                        {opt.name}
                      </h3>
                      <p className="text-[#94A3B8] text-sm leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="absolute bottom-0 left-0 w-full glass-panel border-t border-gray-800 p-6 lg:px-16 z-30 flex justify-between items-center rounded-b-[32px]">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-[#94A3B8] hover:text-white font-bold px-6 py-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Voltar
        </button>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onComplete}
            className="text-[#94A3B8] hover:text-white font-bold px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            Pular
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="bg-brand-blue text-[#030406] font-bold text-lg px-8 py-3 rounded-2xl hover:bg-[#6aa2c0] hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            Finalizar <i className="fa-solid fa-check text-sm"></i>
          </button>
        </div>
      </footer>
    </main>
  );
};
