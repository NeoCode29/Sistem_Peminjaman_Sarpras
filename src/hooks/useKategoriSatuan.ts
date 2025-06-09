"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { prisma } from "@/lib/prisma";

interface KategoriSarana {
  id: string;
  nama: string;
}

interface Satuan {
  id: string;
  nama: string;
  singkatan: string;
}

export function useKategoriSatuan() {
  const [kategori, setKategori] = useState<KategoriSarana[]>([]);
  const [satuan, setSatuan] = useState<Satuan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [kategoriData, satuanData] = await Promise.all([
        fetch("/api/kategori").then(res => res.json()),
        fetch("/api/satuan").then(res => res.json())
      ]);

      if (kategoriData.success) {
        setKategori(kategoriData.data);
      } else {
        toast.error("Error", { description: kategoriData.message });
      }

      if (satuanData.success) {
        setSatuan(satuanData.data);
      } else {
        toast.error("Error", { description: satuanData.message });
      }
    } catch (err) {
      const message = "Gagal mengambil data kategori dan satuan";
      setError(message);
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    kategori,
    satuan,
    isLoading,
    error,
    refetch: fetchData
  };
} 