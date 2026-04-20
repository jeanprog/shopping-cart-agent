import { useCallback, useState } from "react";
import { fetchAddresses, type UserAddressDto } from "@/services/addressesApi";

export function useSettingsAddresses(token: string) {
  const [list, setList] = useState<UserAddressDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAddresses(token);
      setList(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { list, loading, error, setError, reload };
}
