/**
 * Regras de apresentação de endereço (sem React) — único lugar para o formato multi-linha.
 */
export type AddressPreviewFields = {
  street: string;
  number: string;
  complement: string | null;
  district: string | null;
  city: string;
  state: string;
  cep: string | null;
};

export function formatAddressPreviewLines(a: AddressPreviewFields): string {
  const p1 = [a.street, a.number].filter(Boolean).join(", ");
  const p2 = [a.complement, a.district].filter(Boolean).join(" · ");
  const p3 = `${a.city} - ${a.state}`;
  const p4 = a.cep ? `CEP ${a.cep}` : "";
  return [p1, p2, p3, p4].filter((x) => x.length > 0).join("\n");
}
