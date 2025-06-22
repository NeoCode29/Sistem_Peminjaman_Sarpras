"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Peminjaman, StatusPeminjaman, StatusPengajuan, StatusPengambilan, StatusPengembalian } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock, FileText, Package, Users } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface PeminjamanCardProps {
  peminjaman: Peminjaman & {
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
  };
}

const getStatusColor = (status: StatusPeminjaman) => {
  switch (status) {
    case "DALAM_PROSES":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "DITERIMA":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "DITOLAK":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "DIBATALKAN":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    case "SELESAI":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getStatusPengajuanColor = (status: StatusPengajuan) => {
  switch (status) {
    case "MENUNGGU_PENINJAUAN":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "PENGAJUAN_DITERIMA":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "PENGAJUAN_DITOLAK":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "DIBATALKAN":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getStatusPengambilanColor = (status: StatusPengambilan) => {
  switch (status) {
    case "MENUNGGU_PENGAMBILAN":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "SUDAH_MENGAMBIL":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "TERLAMBAT_MENGAMBIL":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getStatusPengembalianColor = (status: StatusPengembalian) => {
  switch (status) {
    case "MENUNGGU_PENGEMBALIAN":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "MENUNGGU_VALIDASI":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "SUDAH_MENGEMBALIKAN":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "TERLAMBAT_MENGEMBALIKAN":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const truncateString = (str: string, length: number) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

export function PeminjamanCard({ peminjaman: p }: PeminjamanCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if(pathname.includes("admin")){
      router.push(`/admin/peminjaman/${p.id}`);
    }else{
      router.push(`/peminjam/peminjaman/${p.id}`);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardContent className="pb-3 px-4">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{p.nama_acara}</h3>
              {p.url_surat_pengajuan && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (p.url_surat_pengajuan) {
                      window.open(p.url_surat_pengajuan as string, '_blank');
                    }
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                  title="Lihat Surat Pengajuan"
                >
                  <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(p.tanggal_pengajuan), "dd MMM yyyy", { locale: id })}
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("font-medium", getStatusColor(p.status_peminjaman))}>
              {p.status_peminjaman.replace(/_/g, " ")}
            </Badge>
            <Badge variant="outline" className={cn("font-medium", getStatusPengajuanColor(p.status_pengajuan))}>
              {p.status_pengajuan.replace(/_/g, " ")}
            </Badge>
            {p.status_pengambilan !== "NULL" && (
              <Badge variant="outline" className={cn("font-medium", getStatusPengambilanColor(p.status_pengambilan))}>
                {p.status_pengambilan.replace(/_/g, " ")}
              </Badge>
            )}
            {p.status_pengembalian !== "NULL" && (
              <Badge variant="outline" className={cn("font-medium", getStatusPengembalianColor(p.status_pengembalian))}>
                {p.status_pengembalian.replace(/_/g, " ")}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {p.tanggal_acara_dimulai && format(new Date(p.tanggal_acara_dimulai), "dd MMM yyyy", { locale: id })}
                {p.tanggal_acara_berakhir && ` - ${format(new Date(p.tanggal_acara_berakhir), "dd MMM yyyy", { locale: id })}`}
              </span>
            </div>
            {p.jumlah_peserta && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{p.jumlah_peserta} peserta</span>
              </div>
            )}
            {(p.peminjamanPrasarana.length > 0 || p.peminjamanSarana.length > 0) && (
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>
                  {p.peminjamanPrasarana.length + p.peminjamanSarana.length} item
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {p.deskripsi_acara && (
            <p className="text-sm text-muted-foreground">
              {truncateString(p.deskripsi_acara, 100)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 