import { z } from "zod"
import { StatusSarpras, JenisBarang } from "@prisma/client"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export const imageFileSchema = z.custom<File>()
  .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  )

export const saranaSchema = z.object({
  id: z.string().optional(),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  kategoriId: z.string().min(1, "Kategori harus dipilih"),
  satuanId: z.string().min(1, "Satuan harus dipilih"),
  jenis: z.enum(["BERNOMOR", "TIDAK_BERNOMOR"]),
  stok: z.number().min(1, "Stok minimal 1"),
  sisa: z.number().default(0),
  lokasi: z.string().min(1, "Lokasi harus diisi"),
  image: imageFileSchema.optional(),
  image_url: z.string().optional(),
  detailItems: z.array(z.object({
    id: z.string().optional(),
    nomer_seri: z.string(),
    status: z.enum(["TERSEDIA", "DIPINJAM", "RUSAK", "HILANG"]),
    lokasi: z.string()
  })).optional()
})

export const prasaranaSchema = z.object({
  id: z.string().optional(),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  lokasi: z.string().min(1, "Lokasi harus diisi"),
  kapasitas: z.number().min(1, "Kapasitas minimal 1"),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter"),
  status: z.enum(["TERSEDIA", "DIPINJAM", "RUSAK", "HILANG"]),
  image_files: z.array(imageFileSchema)
    .min(1, "Minimal 1 gambar")
    .max(5, "Maksimal 5 gambar")
})

export type SaranaFormData = z.infer<typeof saranaSchema>
export type PrasaranaFormData = z.infer<typeof prasaranaSchema>

// Shared image validation
export const imageSchema = z.object({
  fileId: z.string(),
  url: z.string().url("Invalid image URL"),
})

// Detail Sarana Schema
export const detailSaranaSchema = z.object({
  id: z.string().optional(),
  nomer_seri: z.string().optional(),
  status: z.nativeEnum(StatusSarpras).default(StatusSarpras.TERSEDIA),
  lokasi: z.string().optional(),
})

// Sarana Schema
export const createSaranaSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  kategoriId: z.string().min(1, "Kategori harus dipilih"),
  satuanId: z.string().min(1, "Satuan harus dipilih"),
  jenis: z.nativeEnum(JenisBarang),
  stok: z.number().min(0).optional(),
  sisa: z.number().min(0).optional(),
  lokasi: z.string().optional(),
  status: z.nativeEnum(StatusSarpras).default("TERSEDIA"),
  image: z.custom<File | null>((val) => {
    if (val === null) return true;
    return val instanceof File;
  }, "Image must be a File object or null").optional(),
  detailSarana: z.array(detailSaranaSchema)
    .optional()
    .refine(
      (details) => {
        if (!details) return true;
        return details.every((detail) => detail.nomer_seri);
      },
      "Nomor seri harus diisi untuk setiap detail sarana"
    ),
})

export const updateSaranaSchema = createSaranaSchema.partial()

// Prasarana Schema
export const createPrasaranaSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  lokasi: z.string().optional(),
  kapasitas: z.number().min(1, "Kapasitas minimal 1").optional(),
  deskripsi: z.string().optional(),
  status: z.nativeEnum(StatusSarpras).default(StatusSarpras.TERSEDIA),
  images: z.array(z.custom<File>((file) => file instanceof File, "Must be a File object"))
    .min(1, "Minimal satu gambar")
    .max(5, "Maksimal 5 gambar"),
})

export const updatePrasaranaSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  lokasi: z.string().min(1, "Lokasi harus diisi"),
  kapasitas: z.number().min(1, "Kapasitas minimal 1 orang"),
  deskripsi: z.string().optional(),
  status: z.nativeEnum(StatusSarpras),
  images: z.instanceof(File).array().optional(),
  imagesToDelete: z.string().array().optional(),
})

// Response Types
export type SaranaResponse<T> = {
  success: boolean;
  message: string;
  data?: T | null;
}

export type PrasaranaResponse<T> = {
  success: boolean;
  message: string;
  data?: T | null;
}

// Query Types
export type SaranaQuery = {
  page?: number;
  limit?: number;
  search?: string;
  kategori?: string;
  status?: StatusSarpras;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
} 