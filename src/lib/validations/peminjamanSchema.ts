import { z } from "zod";

// Base schema without refinements
const basePeminjamanSchema = z.object({
  nama_acara: z.string()
    .min(3, "Nama acara minimal 3 karakter")
    .max(100, "Nama acara maksimal 100 karakter"),
  
  tanggal_acara_dimulai: z.coerce.date()
    .min(new Date(), "Tanggal acara tidak boleh kurang dari hari ini"),
  
  tanggal_acara_berakhir: z.coerce.date(),
  
  jumlah_peserta: z.coerce.number()
    .min(1, "Jumlah peserta minimal 1 orang")
    .max(1000, "Jumlah peserta maksimal 1000 orang"),
  
  deskripsi_acara: z.string()
    .min(10, "Deskripsi acara minimal 10 karakter")
    .max(500, "Deskripsi acara maksimal 500 karakter"),
  
  surat_pengajuan: z.instanceof(File)
    .refine((file) => file.size <= 5000000, "Ukuran file maksimal 5MB")
    .refine(
      (file) => ["application/pdf"].includes(file.type),
      "Format file harus PDF"
    ),
  
  ormawa: z.string().optional(),
  unit_pegawai: z.string().optional(),
  
  prasaranaIds: z.array(z.string()).optional(),
  saranaItems: z.array(
    z.object({
      saranaId: z.string(),
      jumlah: z.number().min(1, "Jumlah minimal 1"),
    })
  ).optional(),
});

// Add refinement for date validation
export const peminjamanFormSchema = basePeminjamanSchema.refine(
  (data) => data.tanggal_acara_berakhir >= data.tanggal_acara_dimulai,
  {
    message: "Tanggal berakhir tidak boleh kurang dari tanggal dimulai",
    path: ["tanggal_acara_berakhir"],
  }
);

// Type for form data
export type PeminjamanFormData = z.infer<typeof peminjamanFormSchema>;

// Create partial schema for updates (without surat_pengajuan)
const partialSchema = basePeminjamanSchema.partial().omit({ surat_pengajuan: true });

// Add refinement for date validation to partial schema
export const updatePeminjamanSchema = partialSchema.refine(
  (data) => {
    if (data.tanggal_acara_dimulai && data.tanggal_acara_berakhir) {
      return data.tanggal_acara_berakhir >= data.tanggal_acara_dimulai;
    }
    return true;
  },
  {
    message: "Tanggal berakhir tidak boleh kurang dari tanggal dimulai",
    path: ["tanggal_acara_berakhir"],
  }
);

// Type for update data
export type UpdatePeminjamanData = z.infer<typeof updatePeminjamanSchema>; 