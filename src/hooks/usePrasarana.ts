"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PrasaranaWithImages } from "@/service/prasaranaService";
import { createPrasaranaSchema, updatePrasaranaSchema } from "@/lib/validations/sarpras";
import { z } from "zod";
import { StatusSarpras } from "@prisma/client";
import {
  getAllPrasarana,

  createPrasarana,
  updatePrasarana,
  deletePrasarana,
} from "@/actions/prasaranaActions";

interface FetchPrasaranaOptions {
  status?: StatusSarpras;
}

export function usePrasarana() {
  const [data, setData] = useState<PrasaranaWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (options?: FetchPrasaranaOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllPrasarana(options);
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch {
      const message = "Gagal mengambil data prasarana";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreate = async (data: z.infer<typeof createPrasaranaSchema>) => {


    try {
      setIsLoading(true);
      
      // Validate images
      if (!data.images || data.images.length === 0) {
        throw new Error("Minimal satu gambar harus diupload");
      }

      // Validate each image
      const invalidImages = data.images.filter(
        file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024
      );

      if (invalidImages.length > 0) {
        throw new Error("Beberapa file tidak valid: harus berupa gambar dan ukuran maksimal 5MB");
      }

      const result = await createPrasarana(data);
      
      if (result.success) {
        toast.success("Sukses", { description: "Prasarana berhasil dibuat" });
        await fetchData();
        return true;
      } else {
        toast.error("Error", { description: result.message });
        return false;
      }
    } catch (error) {
      toast.error("Error", { 
        description: error instanceof Error ? error.message : "Gagal membuat prasarana" 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: z.infer<typeof updatePrasaranaSchema>) => {

    try {
      setIsLoading(true);

      // Validate images if provided
      if (data.images?.length) {
        // Validate each image
        const invalidImages = data.images.filter(
          file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024
        );

        if (invalidImages.length > 0) {
          throw new Error("Beberapa file tidak valid: harus berupa gambar dan ukuran maksimal 5MB");
        }
      }

      const result = await updatePrasarana(id, data);
      
      if (result.success) {
        toast.success("Sukses", { description: "Prasarana berhasil diupdate" });
        await fetchData();
        return true;
      } else {
        toast.error("Error", { description: result.message });
        return false;
      }
    } catch (error) {
      toast.error("Error", { 
        description: error instanceof Error ? error.message : "Gagal mengupdate prasarana" 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await deletePrasarana(id);
      
      if (result.success) {
        toast.success("Sukses", { description: "Prasarana berhasil dihapus" });
        await fetchData();
        return true;
      } else {
        toast.error("Error", { description: result.message });
        return false;
      }
    } catch (error) {
      toast.error("Error", { description: "Gagal menghapus prasarana" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchData,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
} 