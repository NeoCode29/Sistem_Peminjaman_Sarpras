"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { SarprasPeminjaman } from "@prisma/client";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getAllOrmawaAction } from "@/actions/ormawaActions";

interface PeminjamanFormProps {
  userData: {
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
  } | null;
  isLoading: boolean;
  error: string | null;
  onDataChange?: (data: {
    ormawa?: string;
    unit_pegawai?: string;
  }) => void;
}

interface FormData {
  name: string;
  email: string;
  number_phone: string;
  ormawa?: string;
  unit_pegawai?: string;
  nama_acara: string;
  deskripsi_acara: string;
  jumlah_peserta: number;
  tanggal_acara_dimulai: Date;
  waktu_acara_dimulai: string;
  tanggal_acara_berakhir: Date;
  waktu_acara_berakhir: string;
  tanggal_pengambilan: Date;
  tanggal_pengembalian: Date;
  sarpras_peminjaman: "SARANA" | "PRASARANA" | "BOTH";
  url_surat_pengajuan: string;
  selectedSarana?: Array<{ id: string; nama: string; jumlah: number }>;
  selectedPrasarana?: { id: string; nama: string };
  minDaysBeforeEvent: number;
}

const baseSchema = z.object({
  // Section 1: Data Diri
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  number_phone: z.string().min(1, "Nomor telepon harus diisi"),
  ormawa: z.string().optional(),
  unit_pegawai: z.string().optional(),

  // Section 2: Data Acara
  nama_acara: z.string().min(1, "Nama acara harus diisi"),
  deskripsi_acara: z.string().min(1, "Deskripsi acara harus diisi"),
  jumlah_peserta: z.number().min(1, "Jumlah peserta harus diisi"),
  tanggal_acara_dimulai: z.date({
    required_error: "Tanggal mulai acara harus diisi",
  }),
  waktu_acara_dimulai: z.string().min(1, "Waktu mulai acara harus diisi"),
  tanggal_acara_berakhir: z.date({
    required_error: "Tanggal selesai acara harus diisi",
  }),
  waktu_acara_berakhir: z.string().min(1, "Waktu selesai acara harus diisi"),
  tanggal_pengambilan: z.date({
    required_error: "Tanggal pengambilan harus diisi",
  }),
  tanggal_pengembalian: z.date({
    required_error: "Tanggal pengembalian harus diisi",
  }),
  sarpras_peminjaman: z.enum(["SARANA", "PRASARANA", "BOTH"]),
  url_surat_pengajuan: z.string().min(1, "Surat pengajuan harus diupload"),

  // Section 3: Pemilihan Sarana/Prasarana
  selectedSarana: z.array(z.object({
    id: z.string(),
    nama: z.string(),
    jumlah: z.number().min(1, "Jumlah harus diisi")
  })).optional(),
  selectedPrasarana: z.object({
    id: z.string(),
    nama: z.string()
  }).optional(),

  // Hidden field for validation
  minDaysBeforeEvent: z.number()
});

const formSchema = baseSchema.superRefine((data, ctx) => {
  const today = startOfDay(new Date());
  const eventStart = new Date(`${format(data.tanggal_acara_dimulai, 'yyyy-MM-dd')}T${data.waktu_acara_dimulai}`);
  const eventEnd = new Date(`${format(data.tanggal_acara_berakhir, 'yyyy-MM-dd')}T${data.waktu_acara_berakhir}`);
  const pickupDate = startOfDay(data.tanggal_pengambilan);
  const returnDate = startOfDay(data.tanggal_pengembalian);

  // Check minimum days before event
  if (isBefore(eventStart, addDays(today, data.minDaysBeforeEvent))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Acara harus dijadwalkan minimal sesuai hari yang ditentukan sebelum pelaksanaan"
    });
  }

  // Check event end is after start
  if (!isAfter(eventEnd, eventStart)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal selesai acara harus setelah tanggal mulai"
    });
  }

  // Check pickup is before event start
  if (!isBefore(pickupDate, eventStart)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pengambilan harus sebelum acara dimulai"
    });
  }

  // Check return is after event end
  if (!isAfter(returnDate, eventEnd)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pengembalian harus setelah acara selesai"
    });
  }
});

export function PeminjamanForm({ userData, isLoading, error, onDataChange }: PeminjamanFormProps) {
  const [ormawaList, setOrmawaList] = useState<Array<{ id: string; nama: string }>>([]);
  const [isLoadingOrmawa, setIsLoadingOrmawa] = useState(true);

  useEffect(() => {
    const fetchOrmawa = async () => {
      try {
        const response = await getAllOrmawaAction();
        if (response.data) {
          setOrmawaList(response.data);
        }
      } catch (error) {
        console.error("Error fetching ormawa:", error);
      } finally {
        setIsLoadingOrmawa(false);
      }
    };

    fetchOrmawa();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!userData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          User data not found
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nama</Label>
          <Input value={userData.name || ""} disabled />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={userData.email || ""} disabled />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nomor Telepon</Label>
        <Input value={userData.number_phone || ""} disabled />
      </div>

      {/* Mahasiswa Fields */}
      {userData.position === "mahasiswa" && userData.mahasiswa && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NIM</Label>
              <Input value={userData.mahasiswa.nim || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Jurusan</Label>
              <Input value={userData.mahasiswa.jurusanJurusan?.nama || ""} disabled />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Program Studi</Label>
            <Input value={userData.mahasiswa.prodiProdi?.nama || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>UKM/Organisasi</Label>
            {isLoadingOrmawa ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={(value) => onDataChange?.({ ormawa: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih UKM/Organisasi" />
                </SelectTrigger>
                <SelectContent>
                  {ormawaList.map((ormawa) => (
                    <SelectItem key={ormawa.id} value={ormawa.id}>
                      {ormawa.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </>
      )}

      {/* Pegawai Fields */}
      {userData.position === "pegawai" && userData.pegawai && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NIP/NDK/NIDN</Label>
              <Input value={userData.pegawai.nomer_induk || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input 
                defaultValue={userData.pegawai.unit_pegawai || ""}
                onChange={(e) => onDataChange?.({ unit_pegawai: e.target.value })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
} 