"use client";

import { Peminjaman } from "@prisma/client";
import { PeminjamanCard } from "./peminjaman-card";
import { Loader2 } from "lucide-react";

interface PeminjamanListProps {
  isLoading: boolean;
  peminjaman: Array<Peminjaman & {
    peminjamanPrasarana: {
      prasarana: {
        nama: string;
      };
    }[];
    peminjamanSarana: {
      sarana: {
        nama: string;
      };
      jumlah: number;
    }[];
  }>;
}

export function PeminjamanList({ isLoading, peminjaman }: PeminjamanListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (peminjaman.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Tidak ada peminjaman ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {peminjaman.map((p) => (
        <PeminjamanCard key={p.id} peminjaman={p} />
      ))}
    </div>
  );
} 