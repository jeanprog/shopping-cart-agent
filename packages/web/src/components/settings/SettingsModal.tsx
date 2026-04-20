import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "../../lib/utils";
import {
  createAddress,
  deleteAddressApi,
  setDefaultAddressApi,
} from "../../services/addressesApi";
import { useSettingsAddresses } from "../../hooks/useSettingsAddresses";
import { toSettingsCreateAddressBody } from "@/domain/settingsAddressMapper";
import {
  settingsAddressFormSchema,
  type SettingsAddressFormValues,
} from "@/schemas/settingsAddressForm";

const ADDRESS_FORM_DEFAULTS: SettingsAddressFormValues = {
  label: "Novo endereço",
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

export type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  token: string;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  token,
}) => {
  const { list, loading, error, setError, reload } =
    useSettingsAddresses(token);
  const [adding, setAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsAddressFormValues>({
    resolver: zodResolver(settingsAddressFormSchema),
    defaultValues: ADDRESS_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (open) void reload();
  }, [open, reload]);

  if (!open) return null;

  const onValidSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await createAddress(
        token,
        toSettingsCreateAddressBody(data, list.length === 0),
      );
      reset(ADDRESS_FORM_DEFAULTS);
      setAdding(false);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    }
  });

  const remove = async (id: string) => {
    if (!confirm("Remover este endereço?")) return;
    try {
      await deleteAddressApi(token, id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao remover");
    }
  };

  const makeDefault = async (id: string) => {
    try {
      await setDefaultAddressApi(token, id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-brand-dark border border-gray-800 rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center shrink-0">
          <h2 id="settings-title" className="text-lg font-bold text-white">
            Endereços
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-muted hover:text-white p-2 rounded-lg"
            aria-label="Fechar"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {loading && (
            <p className="text-sm text-brand-muted">Carregando…</p>
          )}

          {!adding ? (
            <>
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full py-3 rounded-xl border border-brand-blue/40 text-brand-blue font-semibold hover:bg-brand-blue/10"
              >
                + Adicionar endereço
              </button>
              <ul className="space-y-3">
                {list.map((a) => (
                  <li
                    key={a.id}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col gap-2",
                      a.isDefault
                        ? "border-brand-blue bg-brand-blue/5"
                        : "border-gray-800 bg-brand-gray/40",
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-bold text-white flex items-center gap-2">
                          {a.label}
                          {a.isDefault && (
                            <span className="text-[10px] uppercase bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded">
                              Padrão
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-brand-muted mt-1 whitespace-pre-line">
                          {a.street}, {a.number}
                          {a.complement ? ` — ${a.complement}` : ""}
                          {"\n"}
                          {a.city} - {a.state}
                          {a.cep ? ` · CEP ${a.cep}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {!a.isDefault && (
                        <button
                          type="button"
                          onClick={() => void makeDefault(a.id)}
                          className="text-xs font-semibold text-brand-blue hover:underline"
                        >
                          Usar como padrão
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void remove(a.id)}
                        className="text-xs font-semibold text-red-400 hover:underline ml-auto"
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {list.length === 0 && !loading && (
                <p className="text-sm text-brand-muted text-center py-6">
                  Nenhum endereço salvo.
                </p>
              )}
            </>
          ) : (
            <form className="space-y-3" onSubmit={onValidSubmit} noValidate>
              {(
                [
                  ["label", "Rótulo", "text"],
                  ["cep", "CEP", "text"],
                  ["street", "Rua", "text"],
                  ["number", "Número", "text"],
                  ["complement", "Complemento", "text"],
                  ["district", "Bairro", "text"],
                  ["city", "Cidade", "text"],
                  ["state", "UF", "text"],
                ] as const
              ).map(([key, ph, type]) => (
                <div key={key}>
                  <input
                    type={type}
                    {...register(key)}
                    placeholder={ph}
                    className="w-full px-3 py-2 rounded-lg bg-brand-gray border border-gray-700 text-white text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-blue"
                  />
                  {errors[key] && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors[key]?.message}
                    </p>
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    reset(ADDRESS_FORM_DEFAULTS);
                  }}
                  className="flex-1 py-2 rounded-lg border border-gray-700 text-brand-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-lg bg-brand-blue text-brand-dark font-bold disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
