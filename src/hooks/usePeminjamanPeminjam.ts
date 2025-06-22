"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StatusPeminjaman, StatusPengajuan } from "@prisma/client";
import {
  createPeminjamanAction,
  updatePeminjamanAction,
  getPeminjamanListAction,
  getPeminjamanDetailAction,
  updatePeminjamanItemsAction,
  confirmPickupAction,
  confirmReturnAction,
  cancelPeminjamanAction,
  updatePickupChecklistAction,
  updateReturnChecklistAction,
} from "@/actions/peminjamanActions";
import { getUserByIdAction } from "@/actions/userActions";
import { CreatePeminjamanInput, UpdatePeminjamanInput } from "@/types/peminjaman";

interface UserData {
  name: string | null;
  email: string | null;
  number_phone: string | null;
  position: "mahasiswa" | "pegawai" | null;
  mahasiswa?: {
    nim: string | null;
    jurusanId: string | null;
    prodiId: string | null;
    jurusanJurusan?: {
      nama: string;
    } | null;
    prodiProdi?: {
      nama: string;
    } | null;
  } | null;
  pegawai?: {
    nomer_induk: string | null;
    unit_pegawai: string | null;
  } | null;
}

interface UserWithRelations {
  name: string | null;
  email: string | null;
  number_phone: string | null;
  position: string | null;
  mahasiswa: {
    nim: string | null;
    jurusanId: string | null;
    prodiId: string | null;
    jurusanJurusan?: {
      nama: string;
    } | null;
    prodiProdi?: {
      nama: string;
    } | null;
  } | null;
  pegawai: {
    nomer_induk: string | null;
    unit_pegawai: string | null;
  } | null;
}

export function usePeminjamanPeminjam(userId: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserByIdAction(userId, true);
        
        if (response.data) {
          const user = response.data as unknown as UserWithRelations;
          setUserData({
            name: user.name,
            email: user.email,
            number_phone: user.number_phone,
            position: user.position as "mahasiswa" | "pegawai" | null,
            mahasiswa: user.mahasiswa ? {
              nim: user.mahasiswa.nim,
              jurusanId: user.mahasiswa.jurusanId,
              prodiId: user.mahasiswa.prodiId,
              jurusanJurusan: user.mahasiswa.jurusanJurusan,
              prodiProdi: user.mahasiswa.prodiProdi
            } : null,
            pegawai: user.pegawai ? {
              nomer_induk: user.pegawai.nomer_induk,
              unit_pegawai: user.pegawai.unit_pegawai
            } : null
          });
        } else {
          setUserError(response.error || "Failed to fetch user data");
        }
      } catch (err) {
        setUserError(err instanceof Error ? err.message : "Failed to fetch user data");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const createPeminjaman = async (data: CreatePeminjamanInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createPeminjamanAction(userId, { ...data, userId });
      if (result.error) throw new Error(result.error);
      router.refresh();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create peminjaman");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePeminjaman = async (peminjamanId: string, data: UpdatePeminjamanInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updatePeminjamanAction(userId, peminjamanId, data);
      if (result.error) throw new Error(result.error);
      router.refresh();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update peminjaman");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPeminjamanList = async (params: {
    search?: string;
    status?: StatusPeminjaman;
    statusPengajuan?: StatusPengajuan;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPeminjamanListAction(userId, params);
      if (result.error) throw new Error(result.error);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get peminjaman list");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPeminjamanDetail = async (peminjamanId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPeminjamanDetailAction(userId, peminjamanId);
      if (result.error) throw new Error(result.error);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get peminjaman detail");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePeminjamanItems = async (
    peminjamanId: string,
    items: {
      prasaranaIds?: string[];
      saranaItems?: { saranaId: string; jumlah: number }[];
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updatePeminjamanItemsAction(userId, peminjamanId, items);
      if (result.error) throw new Error(result.error);
      router.refresh();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update peminjaman items");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPickup = async (peminjamanId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await confirmPickupAction(userId, peminjamanId);
      if (result.error) throw new Error(result.error);
      router.refresh();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm pickup");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReturn = async (peminjamanId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await confirmReturnAction(userId, peminjamanId);
      if (result.error) throw new Error(result.error);
      router.refresh();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm return");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPeminjaman = async (peminjamanId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await cancelPeminjamanAction(userId, peminjamanId);
      if (result.error) throw new Error(result.error);
      router.refresh();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel peminjaman");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePickupChecklist = async (
    peminjamanId: string,
    checklist: {
      prasaranaIds?: string[];
      saranaItems?: { saranaId: string; jumlah: number; detailItems?: string[] }[];
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updatePickupChecklistAction(userId, peminjamanId, checklist);
      if (result.error) throw new Error(result.error);
      router.refresh();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pickup checklist");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReturnChecklist = async (
    peminjamanId: string,
    checklist: {
      prasaranaIds?: string[];
      saranaItems?: { saranaId: string; jumlah?: number; detailItems?: string[] }[];
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateReturnChecklistAction(userId, peminjamanId, checklist);
      if (result.error) throw new Error(result.error);
      router.refresh();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update return checklist");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    userData,
    isLoadingUser,
    userError,
    createPeminjaman,
    updatePeminjaman,
    getPeminjamanList,
    getPeminjamanDetail,
    updatePeminjamanItems,
    confirmPickup,
    confirmReturn,
    cancelPeminjaman,
    updatePickupChecklist,
    updateReturnChecklist,
  };
}


