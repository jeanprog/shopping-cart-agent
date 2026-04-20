import React, { useState } from "react";
import { useForm, type SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { createAddress } from "@/services/addressesApi";
import { patchOnboardingComplete } from "@/services/authApi";
import {
  addressOnboardingFormSchema,
  type AddressOnboardingFormInput,
} from "@/schemas/addressOnboarding";

export type AddressOnboardingPageProps = {
  token: string;
  onComplete: () => void;
  /** Pula cadastro de endereço e marca onboarding concluído */
  onSkip: () => void;
};

export const AddressOnboardingPage: React.FC<AddressOnboardingPageProps> = ({
  token,
  onComplete,
  onSkip,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<AddressOnboardingFormInput>({
    resolver: zodResolver(addressOnboardingFormSchema),
    defaultValues: {
      label: "Casa - Principal",
      cep: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      stateUf: "",
      deliveryPref: "economic",
      notifyOrders: true,
      notifyPromos: false,
    },
  });

  const deliveryPref = watch("deliveryPref");

  const onInvalid: SubmitErrorHandler<AddressOnboardingFormInput> = (
    formErrors,
  ) => {
    setError(
      formErrors.street?.message ?? "Preencha rua, número, cidade e UF.",
    );
  };

  const onValid = async (data: AddressOnboardingFormInput) => {
    setError(null);
    setBusy(true);
    try {
      await createAddress(token, {
        label: data.label.trim() || "Casa",
        cep: data.cep.trim() || undefined,
        street: data.street.trim(),
        number: data.number.trim(),
        complement: data.complement.trim() || undefined,
        district: data.district.trim() || undefined,
        city: data.city.trim(),
        state: data.stateUf.trim().slice(0, 2).toUpperCase(),
        deliveryPreference: data.deliveryPref,
        notifyOrderUpdates: data.notifyOrders,
        notifyPromos: data.notifyPromos,
        finalizeOnboarding: true,
        isDefault: true,
      });
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    setBusy(true);
    setError(null);
    try {
      await patchOnboardingComplete(token, true);
      onSkip();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao pular.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="w-full max-w-[1440px] min-h-[min(100dvh,1024px)] mx-auto flex flex-col relative overflow-hidden bg-[#0A0C10] shadow-2xl rounded-[32px] m-4 lg:m-8 border border-white/5">
      <header className="w-full px-8 lg:px-16 pt-12 pb-6 flex justify-between items-center bg-[#0A0C10] z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#050505] rounded-xl flex items-center justify-center border border-white/10 shadow-soft">
            <i className="fa-solid fa-bag-shopping text-brand-blue text-xl" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">
            ShopAI
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-muted">
            Passo 2 de 2
          </span>
          <div className="flex gap-2">
            <div className="h-1.5 w-16 bg-white/10 rounded-full" />
            <div className="h-1.5 w-16 bg-brand-blue rounded-full shadow-[0_0_10px_rgba(123,179,209,0.3)]" />
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden min-h-0">
        <section className="w-full lg:w-1/3 bg-[#050505] p-8 lg:p-16 flex flex-col justify-center border-r border-white/5 relative">
          <div className="relative z-10 max-w-sm">
            <div className="w-16 h-16 bg-[#0A0C10] rounded-2xl shadow-soft flex items-center justify-center mb-8 relative border border-white/10">
              <i className="fa-solid fa-truck-fast text-3xl text-brand-blue" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-blue rounded-full border-2 border-[#0A0C10] animate-pulse shadow-[0_0_10px_rgba(123,179,209,0.5)]" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Para onde enviamos?
            </h1>
            <p className="text-lg text-brand-muted font-medium leading-relaxed mb-8">
              Informe o CEP e o endereço para calcularmos o frete e entregarmos
              seus pedidos com segurança.
            </p>
            <div className="glass-panel p-5 rounded-2xl shadow-soft border border-white/5">
              <p className="text-sm font-semibold text-white flex items-start gap-3">
                <i className="fa-solid fa-shield-halved text-brand-blue mt-0.5 text-lg" />
                <span className="text-brand-muted">
                  Seus dados são usados apenas para logística e comunicação
                  essencial.
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="w-full lg:w-2/3 p-8 lg:p-16 overflow-y-auto bg-[#0A0C10] min-h-0">
          <form
            id="address-onboarding-form"
            className="max-w-3xl mx-auto space-y-10 pb-28"
            onSubmit={handleSubmit(onValid, onInvalid)}
            noValidate
          >
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-map-location-dot text-brand-blue" />
                Local de Entrega
              </h2>
              <div className="bg-[#050505] p-6 rounded-[24px] border border-white/5 space-y-4">
                <label className="block text-xs text-brand-muted font-medium">
                  Nome do endereço
                </label>
                <input
                  type="text"
                  {...register("label")}
                  className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Ex.: Casa, Trabalho"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    {...register("cep")}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue"
                    placeholder="CEP (ex.: 01001-000)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      {...register("street")}
                      className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue"
                      placeholder="Rua / Avenida"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      {...register("number")}
                      className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue"
                      placeholder="Número"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      {...register("complement")}
                      className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue"
                      placeholder="Complemento (apto, bloco…)"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      {...register("district")}
                      className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue"
                      placeholder="Bairro"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      {...register("city")}
                      className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue"
                      placeholder="Cidade"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      {...register("stateUf")}
                      maxLength={2}
                      className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue uppercase"
                      placeholder="UF"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-box-open text-brand-blue" />
                Preferência de Entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(
                  [
                    ["fast", "Rápida", "fa-bolt", "Prioridade na entrega."],
                    [
                      "economic",
                      "Econômica",
                      "fa-piggy-bank",
                      "Melhor custo-benefício.",
                    ],
                  ] as const
                ).map(([key, title, icon, desc]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setValue("deliveryPref", key, { shouldValidate: true })
                    }
                    className={cn(
                      "text-left border rounded-[24px] p-6 flex flex-col gap-4 transition-all",
                      deliveryPref === key
                        ? "border-brand-blue bg-brand-blue/5 shadow-[0_0_0_1px_rgba(123,179,209,0.5)]"
                        : "border-white/5 bg-[#0A0C10] hover:border-white/10",
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#050505] text-brand-blue flex items-center justify-center text-xl border border-white/5">
                      <i className={cn("fa-solid", icon)} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">
                        {title}
                      </h3>
                      <p className="text-brand-muted text-sm leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-bell text-brand-blue" />
                Notificações
              </h2>
              <div className="bg-[#050505] p-6 rounded-[24px] border border-white/5 space-y-4">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 accent-brand-blue w-4 h-4 rounded"
                    {...register("notifyOrders")}
                  />
                  <div>
                    <h4 className="font-bold text-white">Atualizações de Pedidos</h4>
                    <p className="text-sm text-brand-muted mt-1">
                      Alertas sobre status, rastreio e entrega.
                    </p>
                  </div>
                </label>
                <div className="h-px w-full bg-white/5" />
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 accent-brand-blue w-4 h-4 rounded"
                    {...register("notifyPromos")}
                  />
                  <div>
                    <h4 className="font-bold text-white">Promoções e Ofertas</h4>
                    <p className="text-sm text-brand-muted mt-1">
                      Recomendações e descontos.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </section>
      </div>

      <footer className="shrink-0 w-full bg-[#0A0C10]/90 backdrop-blur-xl border-t border-white/5 p-6 lg:px-16 z-30 flex flex-wrap justify-between items-center gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void skip()}
          className="text-brand-muted hover:text-white font-bold px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
        >
          Pular por agora
        </button>
        <button
          type="submit"
          form="address-onboarding-form"
          disabled={busy}
          className="bg-brand-blue text-[#030406] font-bold text-lg px-8 py-3 rounded-2xl hover:bg-[#6aa2c0] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(123,179,209,0.2)] disabled:opacity-50"
        >
          {busy ? "Salvando…" : "Finalizar"}{" "}
          {!busy && <i className="fa-solid fa-check text-sm" />}
        </button>
      </footer>
    </main>
  );
};
