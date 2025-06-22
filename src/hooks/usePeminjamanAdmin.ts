"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StatusPeminjaman, StatusPengajuan } from "@prisma/client";
import {
  getAllPeminjamanAction,
  getAdminPeminjamanDetailAction,
  adminCancelPeminjamanAction,
  validatePeminjamanAction,
  rejectPeminjamanAction,
  validatePickupAction,
  rejectPickupAction,
  validateReturnAction,
  rejectReturnAction,
} from "@/actions/peminjamanActions";

export function usePeminjamanAdmin(adminId: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedData, setCachedData] = useState<Record<string, unknown>>({});

  const getAllPeminjaman = useCallback(async (params: {
    search?: string;
    status?: StatusPeminjaman;
    statusPengajuan?: StatusPengajuan;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) => {
    const cacheKey = JSON.stringify(params);
    if (cachedData[cacheKey]) {
      return cachedData[cacheKey];
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllPeminjamanAction(adminId, params);
      if (result.error) throw new Error(result.error);
      setCachedData(prev => ({ ...prev, [cacheKey]: result.data }));
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get peminjaman list");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, cachedData]);

  const getPeminjamanDetail = useCallback(async (peminjamanId: string) => {
    if (cachedData[peminjamanId]) {
      return cachedData[peminjamanId];
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getAdminPeminjamanDetailAction(adminId, peminjamanId);
      if (result.error) throw new Error(result.error);
      setCachedData(prev => ({ ...prev, [peminjamanId]: result.data }));
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get peminjaman detail");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, cachedData]);

  const invalidateCache = useCallback(() => {
    setCachedData({});
    router.refresh();
  }, [router]);

  const cancelPeminjaman = useCallback(async (peminjamanId: string, message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminCancelPeminjamanAction(adminId, peminjamanId, message);
      if (result.error) throw new Error(result.error);
      invalidateCache();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel peminjaman");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, invalidateCache]);

  const validatePeminjaman = useCallback(async (peminjamanId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await validatePeminjamanAction(adminId, peminjamanId);
      if (result.error) throw new Error(result.error);
      invalidateCache();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate peminjaman");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, invalidateCache]);

  const rejectPeminjaman = useCallback(async (peminjamanId: string, message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await rejectPeminjamanAction(adminId, peminjamanId, message);
      if (result.error) throw new Error(result.error);
      invalidateCache();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject peminjaman");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, invalidateCache]);

  const validatePickup = useCallback(async (peminjamanId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await validatePickupAction(adminId, peminjamanId);
      if (result.error) throw new Error(result.error);
      invalidateCache();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate pickup");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, invalidateCache]);

  const rejectPickup = useCallback(async (peminjamanId: string, message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await rejectPickupAction(adminId, peminjamanId, message);
      if (result.error) throw new Error(result.error);
      invalidateCache();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject pickup");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, invalidateCache]);

  const validateReturn = useCallback(async (peminjamanId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await validateReturnAction(adminId, peminjamanId);
      if (result.error) throw new Error(result.error);
      invalidateCache();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate return");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, invalidateCache]);

  const rejectReturn = useCallback(async (peminjamanId: string, message: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await rejectReturnAction(adminId, peminjamanId, message);
      if (result.error) throw new Error(result.error);
      invalidateCache();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject return");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminId, invalidateCache]);

  return {
    isLoading,
    error,
    getAllPeminjaman,
    getPeminjamanDetail,
    cancelPeminjaman,
    validatePeminjaman,
    rejectPeminjaman,
    validatePickup,
    rejectPickup,
    validateReturn,
    rejectReturn,
  };
}


