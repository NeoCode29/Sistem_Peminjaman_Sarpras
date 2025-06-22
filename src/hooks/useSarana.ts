"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { SaranaWithRelations } from "@/service/saranaService";
import { createSaranaSchema, updateSaranaSchema } from "@/lib/validations/sarpras";
import { z } from "zod";
import { StatusSarpras } from "@prisma/client";
import {
  getSarana,
  createSaranaAction as createSarana,
  updateSaranaAction as updateSarana,
  deleteSaranaAction as deleteSarana,
} from "@/actions/saranaActions";

interface UseSaranaOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function useSarana({ initialPage = 1, initialLimit = 10 }: UseSaranaOptions = {}) {
  const [data, setData] = useState<SaranaWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
  });

  const fetchData = useCallback(async (options: {
    page?: number;
    limit?: number;
    search?: string;
    kategori?: string;
    status?: StatusSarpras;
    orderBy?: {
      field: string;
      direction: "asc" | "desc";
    };
  } = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getSarana(options);
      
      if (result.success && result.data && result.data.total !== undefined) {
        setData(result.data.items);
        setPagination(prev => ({
          ...prev,
          total: result.data!.total,
        }));
      } else {
        setError(result.message);
        toast.error("Error", { description: result.message });
      }
    } catch {
      const message = "Gagal mengambil data sarana";
      setError(message);
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreate = async (data: z.infer<typeof createSaranaSchema>) => {
    try {
      setIsLoading(true);
      const result = await createSarana(data);
      
      if (result.success) {
        toast.success("Sukses", { description: "Sarana berhasil dibuat" });
        await fetchData({ page: pagination.page, limit: pagination.limit });
      } else {
        toast.error("Error", { description: result.message });
      }
      return result;
    } catch {
      const message = "Gagal membuat sarana";
      toast.error("Error", { description: message });
      return { success: false, message, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: z.infer<typeof updateSaranaSchema>) => {
    try {
      setIsLoading(true);
      const result = await updateSarana(id, data);
      
      if (result.success) {
        toast.success("Sukses", { description: "Sarana berhasil diupdate" });
        await fetchData({ page: pagination.page, limit: pagination.limit });
      } else {
        toast.error("Error", { description: result.message });
      }
      return result;
    } catch {
      const message = "Gagal mengupdate sarana";
      toast.error("Error", { description: message });
      return { success: false, message, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await deleteSarana(id);
      
      if (result.success) {
        toast.success("Sukses", { description: "Sarana berhasil dihapus" });
        await fetchData({ page: pagination.page, limit: pagination.limit });
      } else {
        toast.error("Error", { description: result.message });
      }
      return result;
    } catch {
      const message = "Gagal menghapus sarana";
      toast.error("Error", { description: message });
      return { success: false, message, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchData({ ...pagination, page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    fetchData({ limit: newLimit, page: 1 });
  };

  return {
    data,
    isLoading,
    error,
    pagination,
    fetchData,
    handleCreate,
    handleUpdate,
    handleDelete,
    handlePageChange,
    handleLimitChange,
  };
} 