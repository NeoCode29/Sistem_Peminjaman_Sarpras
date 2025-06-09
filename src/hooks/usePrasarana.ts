"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PrasaranaWithImages } from "@/service/prasaranaService";
import { createPrasaranaSchema, updatePrasaranaSchema } from "@/lib/validations/sarpras";
import { z } from "zod";
import { StatusSarpras } from "@prisma/client";
import {
  getAllPrasarana,
  getPrasaranaById,
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
    } catch (err) {
      const message = "Gagal mengambil data prasarana";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreate = async (data: z.infer<typeof createPrasaranaSchema>) => {
    console.log("[usePrasarana] Starting create with data:", {
      ...data,
      images: data.images?.map(img => ({
        name: img.name,
        type: img.type,
        size: img.size
      }))
    });

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

      console.log("[usePrasarana] Validation passed, calling createPrasarana");
      const result = await createPrasarana(data);
      
      if (result.success) {
        console.log("[usePrasarana] Create successful:", result.data);
        toast.success("Sukses", { description: "Prasarana berhasil dibuat" });
        await fetchData();
        return true;
      } else {
        console.error("[usePrasarana] Create failed:", result.message);
        toast.error("Error", { description: result.message });
        return false;
      }
    } catch (err) {
      console.error("[usePrasarana] Create error:", err);
      toast.error("Error", { 
        description: err instanceof Error ? err.message : "Gagal membuat prasarana" 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: z.infer<typeof updatePrasaranaSchema>) => {
    console.log("[usePrasarana] Starting update for id:", id, "with data:", {
      ...data,
      images: data.images?.map(img => ({
        name: img.name,
        type: img.type,
        size: img.size
      }))
    });

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

      console.log("[usePrasarana] Validation passed, calling updatePrasarana");
      const result = await updatePrasarana(id, data);
      
      if (result.success) {
        console.log("[usePrasarana] Update successful:", result.data);
        toast.success("Sukses", { description: "Prasarana berhasil diupdate" });
        await fetchData();
        return true;
      } else {
        console.error("[usePrasarana] Update failed:", result.message);
        toast.error("Error", { description: result.message });
        return false;
      }
    } catch (err) {
      console.error("[usePrasarana] Update error:", err);
      toast.error("Error", { 
        description: err instanceof Error ? err.message : "Gagal mengupdate prasarana" 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("[usePrasarana] Starting delete for id:", id);
    
    try {
      setIsLoading(true);
      const result = await deletePrasarana(id);
      
      if (result.success) {
        console.log("[usePrasarana] Delete successful");
        toast.success("Sukses", { description: "Prasarana berhasil dihapus" });
        await fetchData();
        return true;
      } else {
        console.error("[usePrasarana] Delete failed:", result.message);
        toast.error("Error", { description: result.message });
        return false;
      }
    } catch (err) {
      console.error("[usePrasarana] Delete error:", err);
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