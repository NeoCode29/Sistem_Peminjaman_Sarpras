import { z } from "zod";
import { SarprasPeminjaman } from "@prisma/client";

// Helper function to check if date is before another date
const isBeforeDate = (date1: Date, date2: Date) => {
  return date1.getTime() < date2.getTime();
};

// Helper function to check if date is after another date
const isAfterDate = (date1: Date, date2: Date) => {
  return date1.getTime() > date2.getTime();
};

// Base schema for first step - Event Details
export const eventDetailsSchema = z.object({
  nama_acara: z
    .string()
    .min(3, "Nama acara minimal 3 karakter")
    .max(100, "Nama acara maksimal 100 karakter"),
  deskripsi_acara: z
    .string()
    .min(10, "Deskripsi acara minimal 10 karakter")
    .max(500, "Deskripsi acara maksimal 500 karakter"),
  jumlah_peserta: z
    .number()
    .min(1, "Jumlah peserta minimal 1 orang")
    .max(1000, "Jumlah peserta maksimal 1000 orang"),
  sarpras_peminjaman: z.nativeEnum(SarprasPeminjaman, {
    required_error: "Jenis peminjaman harus dipilih",
  }),
  ormawa: z.string().optional(),
  unit_pegawai: z.string().optional(),
});

// Schema for second step - Date Selection
export const dateSelectionSchema = z.object({
  tanggal_acara_dimulai: z.date({
    required_error: "Tanggal acara dimulai harus diisi",
  }),
  tanggal_acara_berakhir: z.date({
    required_error: "Tanggal acara berakhir harus diisi",
  }),
  tanggal_pengambilan: z.date({
    required_error: "Tanggal pengambilan harus diisi",
  }),
  tanggal_pengembalian: z.date({
    required_error: "Tanggal pengembalian harus diisi",
  }),
}).refine(
  (data) => isBeforeDate(data.tanggal_acara_dimulai, data.tanggal_acara_berakhir),
  {
    message: "Tanggal acara berakhir harus setelah tanggal acara dimulai",
    path: ["tanggal_acara_berakhir"],
  }
).refine(
  (data) => isBeforeDate(data.tanggal_pengambilan, data.tanggal_acara_dimulai),
  {
    message: "Tanggal pengambilan harus sebelum tanggal acara dimulai",
    path: ["tanggal_pengambilan"],
  }
).refine(
  (data) => isAfterDate(data.tanggal_pengembalian, data.tanggal_acara_berakhir),
  {
    message: "Tanggal pengembalian harus setelah tanggal acara berakhir",
    path: ["tanggal_pengembalian"],
  }
);

// Schema for third step - Items Selection
export const itemSelectionSchema = z.object({
  prasaranaIds: z
    .array(z.string())
    .optional()
    .refine((data) => data === undefined || data.length > 0, {
      message: "Pilih minimal satu prasarana",
    }),
  saranaItems: z
    .array(
    z.object({
      saranaId: z.string(),
        jumlah: z.number().min(1, "Jumlah minimal 1"),
    })
    )
    .optional()
    .refine((data) => data === undefined || data.length > 0, {
      message: "Pilih minimal satu sarana",
    }),
});

// Schema for fourth step - Document Upload
export const documentUploadSchema = z.object({
  surat_pengajuan: z
    .any()
    .refine((file) => file?.size <= 5000000, "Ukuran file maksimal 5MB")
    .refine(
      (file) => ["application/pdf"].includes(file?.type),
      "Format file harus PDF"
    ),
  surat_pengajuan_name: z.string(),
});

// Combined schema for the entire form
export const peminjamanFormSchema = z.object({
  eventDetails: eventDetailsSchema,
  dateSelection: dateSelectionSchema,
  itemSelection: itemSelectionSchema,
  documentUpload: documentUploadSchema,
});

// Type inference
export type EventDetailsInput = z.infer<typeof eventDetailsSchema>;
export type DateSelectionInput = z.infer<typeof dateSelectionSchema>;
export type ItemSelectionInput = z.infer<typeof itemSelectionSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type PeminjamanFormInput = z.infer<typeof peminjamanFormSchema>; 