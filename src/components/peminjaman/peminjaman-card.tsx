"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Peminjaman, StatusPeminjaman, StatusPengajuan, StatusPengambilan, StatusPengembalian } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface PeminjamanCardProps {
  peminjaman: Peminjaman & {
    ormawa?: {
      id: string;
      nama: string;
    } | null;
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
      return "bg-yellow-500";
    case "DITERIMA":
      return "bg-green-500";
    case "DITOLAK":
      return "bg-red-500";
    case "DIBATALKAN":
      return "bg-gray-500";
    case "SELESAI":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusPengajuanColor = (status: StatusPengajuan) => {
  switch (status) {
    case "MENUNGGU_PENINJAUAN":
      return "bg-yellow-500";
    case "PENGAJUAN_DITERIMA":
      return "bg-green-500";
    case "PENGAJUAN_DITOLAK":
      return "bg-red-500";
    case "DIBATALKAN":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusPengambilanColor = (status: StatusPengambilan) => {
  switch (status) {
    case "MENUNGGU_PENGAMBILAN":
      return "bg-yellow-500";
    case "SUDAH_MENGAMBIL":
      return "bg-green-500";
    case "TERLAMBAT_MENGAMBIL":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusPengembalianColor = (status: StatusPengembalian) => {
  switch (status) {
    case "MENUNGGU_PENGEMBALIAN":
      return "bg-yellow-500";
    case "SUDAH_MENGEMBALIKAN":
      return "bg-green-500";
    case "TERLAMBAT_MENGEMBALIKAN":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const truncateString = (str: string, length: number) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

export function PeminjamanCard({ peminjaman: p }: PeminjamanCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/peminjam/peminjaman/${p.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{p.nama_acara}</h3>
              {p.url_surat_pengajuan && (
                <a 
                  href={p.url_surat_pengajuan} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <FileText className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={cn("text-white", getStatusColor(p.status_peminjaman))}>
                {p.status_pengajuan.replace(/_/g, " ")}
              </Badge>
              {p.status_pengambilan !== "NULL" && (
                <Badge variant="secondary" className={cn("text-white", getStatusPengambilanColor(p.status_pengambilan))}>
                  {p.status_pengambilan.replace(/_/g, " ")}
                </Badge>
              )}
              {p.status_pengembalian !== "NULL" && (
                <Badge variant="secondary" className={cn("text-white", getStatusPengembalianColor(p.status_pengembalian))}>
                  {p.status_pengembalian.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            {p.deskripsi_acara && (
              <p className="text-sm text-muted-foreground">
                {truncateString(p.deskripsi_acara, 100)}
              </p>
            )}
            {p.ormawa && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Organisasi:</span> {p.ormawa.nama}
              </p>
            )}
          </div>
          <div className="text-sm text-muted-foreground md:text-right md:min-w-[200px]">
            <div className="space-y-1">
              <p>Diajukan: {format(new Date(p.tanggal_pengajuan), "dd MMM yyyy", { locale: id })}</p>
              {p.tanggal_acara_dimulai && (
                <p>Acara: {format(new Date(p.tanggal_acara_dimulai), "dd MMM yyyy", { locale: id })}</p>
              )}
              {p.tanggal_pengambilan && (
                <p>Diambil: {format(new Date(p.tanggal_pengambilan), "dd MMM yyyy", { locale: id })}</p>
              )}
              {p.tanggal_pengembalian && (
                <p>Dikembalikan: {format(new Date(p.tanggal_pengembalian), "dd MMM yyyy", { locale: id })}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 