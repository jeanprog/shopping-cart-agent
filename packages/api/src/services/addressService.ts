import { and, eq } from "drizzle-orm";
import { db } from "../db/index";
import { userAddresses, users } from "../db/schema";
import { DEFAULT_SHIPPING } from "../constants/checkout";

/** Cliente Drizzle dentro de `db.transaction`. */
export type DbTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

export type UserAddressRow = typeof userAddresses.$inferSelect;

export function formatAddressLines(a: UserAddressRow): string {
  const line1 = [a.street, a.number].filter(Boolean).join(", ");
  const line2 = [a.complement, a.district].filter(Boolean).join(" · ");
  const line3 = `${a.city} - ${a.state}`;
  const line4 = a.cep ? `CEP ${a.cep}` : "";
  return [line1, line2, line3, line4].filter((x) => x && x.length > 0).join("\n");
}

export async function listAddresses(userId: string): Promise<UserAddressRow[]> {
  return db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, userId))
    .orderBy(userAddresses.createdAt);
}

export async function getDefaultAddress(
  userId: string,
): Promise<UserAddressRow | null> {
  const [row] = await db
    .select()
    .from(userAddresses)
    .where(
      and(eq(userAddresses.userId, userId), eq(userAddresses.isDefault, true)),
    )
    .limit(1);
  return row ?? null;
}

/** Usado dentro de `db.transaction` — o `tx` do Drizzle é compatível. */
export async function resolveShippingForOrder(
  tx: DbTransaction,
  userId: string,
  preferredAddressId?: string,
): Promise<{
  addressTitle: string;
  addressLines: string;
  addressId: string | null;
}> {
  if (preferredAddressId) {
    const [a] = await tx
      .select()
      .from(userAddresses)
      .where(
        and(
          eq(userAddresses.userId, userId),
          eq(userAddresses.id, preferredAddressId),
        ),
      )
      .limit(1);
    if (a) {
      return {
        addressTitle: a.label,
        addressLines: formatAddressLines(a),
        addressId: a.id,
      };
    }
  }
  const [def] = await tx
    .select()
    .from(userAddresses)
    .where(
      and(eq(userAddresses.userId, userId), eq(userAddresses.isDefault, true)),
    )
    .limit(1);
  if (def) {
    return {
      addressTitle: def.label,
      addressLines: formatAddressLines(def),
      addressId: def.id,
    };
  }
  return {
    addressTitle: DEFAULT_SHIPPING.addressTitle,
    addressLines: DEFAULT_SHIPPING.addressLines,
    addressId: null,
  };
}

async function clearDefaultForUser(tx: DbTransaction, userId: string) {
  await tx
    .update(userAddresses)
    .set({ isDefault: false })
    .where(eq(userAddresses.userId, userId));
}

export async function createAddress(
  userId: string,
  input: {
    label: string;
    cep?: string | null;
    street: string;
    number: string;
    complement?: string | null;
    district?: string | null;
    city: string;
    state: string;
    isDefault?: boolean;
    deliveryPreference?: "fast" | "economic";
    notifyOrderUpdates?: boolean;
    notifyPromos?: boolean;
    finalizeOnboarding?: boolean;
  },
): Promise<{ success: boolean; address?: UserAddressRow; error?: string }> {
  if (!input.label.trim() || !input.street.trim() || !input.number.trim() || !input.city.trim() || !input.state.trim()) {
    return { success: false, error: "Preencha rótulo, rua, número, cidade e UF" };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const existing = await tx
        .select({ n: userAddresses.id })
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId));
      const isFirst = existing.length === 0;
      const makeDefault = isFirst ? true : input.isDefault === true;

      if (makeDefault) {
        await clearDefaultForUser(tx, userId);
      }

      const [row] = await tx
        .insert(userAddresses)
        .values({
          userId,
          label: input.label.trim(),
          cep: input.cep?.trim() || null,
          street: input.street.trim(),
          number: input.number.trim(),
          complement: input.complement?.trim() || null,
          district: input.district?.trim() || null,
          city: input.city.trim(),
          state: input.state.trim(),
          isDefault: makeDefault,
          deliveryPreference: input.deliveryPreference ?? "economic",
          notifyOrderUpdates: input.notifyOrderUpdates ?? true,
          notifyPromos: input.notifyPromos ?? false,
        })
        .returning();

      if (!row) return { ok: false as const, error: "Falha ao salvar endereço" };

      if (input.finalizeOnboarding) {
        await tx
          .update(users)
          .set({ onboardingCompleted: true })
          .where(eq(users.id, userId));
      }

      return { ok: true as const, address: row };
    });

    if (!result.ok) return { success: false, error: result.error };
    return { success: true, address: result.address };
  } catch (e) {
    console.error("createAddress:", e);
    return { success: false, error: "Erro ao criar endereço" };
  }
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: Partial<{
    label: string;
    cep: string | null;
    street: string;
    number: string;
    complement: string | null;
    district: string | null;
    city: string;
    state: string;
    deliveryPreference: "fast" | "economic";
    notifyOrderUpdates: boolean;
    notifyPromos: boolean;
  }>,
): Promise<{ success: boolean; address?: UserAddressRow; error?: string }> {
  const [existing] = await db
    .select()
    .from(userAddresses)
    .where(
      and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)),
    )
    .limit(1);
  if (!existing) return { success: false, error: "Endereço não encontrado" };

  const [row] = await db
    .update(userAddresses)
    .set({
      ...(input.label !== undefined ? { label: input.label.trim() } : {}),
      ...(input.cep !== undefined ? { cep: input.cep?.trim() || null } : {}),
      ...(input.street !== undefined ? { street: input.street.trim() } : {}),
      ...(input.number !== undefined ? { number: input.number.trim() } : {}),
      ...(input.complement !== undefined
        ? { complement: input.complement?.trim() || null }
        : {}),
      ...(input.district !== undefined
        ? { district: input.district?.trim() || null }
        : {}),
      ...(input.city !== undefined ? { city: input.city.trim() } : {}),
      ...(input.state !== undefined ? { state: input.state.trim() } : {}),
      ...(input.deliveryPreference !== undefined
        ? { deliveryPreference: input.deliveryPreference }
        : {}),
      ...(input.notifyOrderUpdates !== undefined
        ? { notifyOrderUpdates: input.notifyOrderUpdates }
        : {}),
      ...(input.notifyPromos !== undefined
        ? { notifyPromos: input.notifyPromos }
        : {}),
    })
    .where(eq(userAddresses.id, addressId))
    .returning();

  if (!row) return { success: false, error: "Falha ao atualizar" };
  return { success: true, address: row };
}

export async function deleteAddress(
  userId: string,
  addressId: string,
): Promise<{ success: boolean; error?: string }> {
  const [existing] = await db
    .select()
    .from(userAddresses)
    .where(
      and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)),
    )
    .limit(1);
  if (!existing) return { success: false, error: "Endereço não encontrado" };

  await db
    .delete(userAddresses)
    .where(
      and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)),
    );

  if (existing.isDefault) {
    const [next] = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId))
      .limit(1);
    if (next) {
      await db
        .update(userAddresses)
        .set({ isDefault: true })
        .where(eq(userAddresses.id, next.id));
    }
  }

  return { success: true };
}

export async function setDefaultAddress(
  userId: string,
  addressId: string,
): Promise<{ success: boolean; error?: string }> {
  const [existing] = await db
    .select()
    .from(userAddresses)
    .where(
      and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)),
    )
    .limit(1);
  if (!existing) return { success: false, error: "Endereço não encontrado" };

  await db.transaction(async (tx) => {
    await tx
      .update(userAddresses)
      .set({ isDefault: false })
      .where(eq(userAddresses.userId, userId));
    await tx
      .update(userAddresses)
      .set({ isDefault: true })
      .where(
        and(
          eq(userAddresses.id, addressId),
          eq(userAddresses.userId, userId),
        ),
      );
  });

  return { success: true };
}
