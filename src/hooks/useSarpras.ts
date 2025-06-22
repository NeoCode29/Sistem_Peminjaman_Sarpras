import { useState, useEffect, useCallback } from "react";
import { getAllSarana } from "@/service/saranaService";
import { getAllPrasarana } from "@/service/prasaranaService";

interface UseSarprasOptions {
  onError?: (error: string) => void;
}

export function useSarpras(options?: UseSarprasOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [sarana, setSarana] = useState<Array<{ id: string; nama: string }>>([]);
  const [prasarana, setPrasarana] = useState<Array<{ id: string; nama: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const loadSarpras = useCallback(async () => {
    setIsLoading(true);
    try {
      const [saranaResult, prasaranaResult] = await Promise.all([
        getAllSarana(),
        getAllPrasarana({ status: "TERSEDIA" })
      ]);

      if (!saranaResult.success) {
        throw new Error(saranaResult.message);
      }

      if (!prasaranaResult.success) {
        throw new Error(prasaranaResult.message);
      }

      // Transform sarana data
      const availableSarana = saranaResult.data?.items
        ? saranaResult.data.items
            .filter(item => item.status === "TERSEDIA" && item.sisa > 0)
            .map(item => ({
              id: item.id,
              nama: item.nama
            }))
        : [];

      // Transform prasarana data
      const availablePrasarana = prasaranaResult.data
        ? prasaranaResult.data.map(item => ({
            id: item.id,
            nama: item.nama
          }))
        : [];

      setSarana(availableSarana);
      setPrasarana(availablePrasarana);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memuat data sarana dan prasarana";
      setError(errorMessage);
      if (options?.onError) {
        options.onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    loadSarpras();
  }, [loadSarpras]);

  return {
    isLoading,
    error,
    sarana,
    prasarana,
    refresh: loadSarpras
  };
} 