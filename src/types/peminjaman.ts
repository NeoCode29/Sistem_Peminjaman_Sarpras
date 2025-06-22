import { SarprasPeminjaman } from "@prisma/client";

export interface CreatePeminjamanInput {
  userId: string;
  nama_acara: string;
  tanggal_acara_dimulai: Date;
  tanggal_acara_berakhir: Date;
  jumlah_peserta: number;
  deskripsi_acara: string;
  surat_pengajuan: Buffer;
  surat_pengajuan_name: string;
  sarpras_peminjaman: SarprasPeminjaman;
  ormawa?: string;
  unit_pegawai?: string;
  prasaranaIds?: string[];
  saranaItems?: {
    saranaId: string;
    jumlah: number;
  }[];
}

export interface UpdatePeminjamanInput {
  nama_acara?: string;
  tanggal_acara_dimulai?: Date;
  tanggal_acara_berakhir?: Date;
  jumlah_peserta?: number;
  deskripsi_acara?: string;
  url_surat_pengajuan?: string;
  ormawa?: string;
  unit_pegawai?: string;
} 