import { z } from "zod"
import { StatusPeminjaman } from "@/types/statusPeminjaman"

// Schema untuk validasi file gambar
const imageFileSchema = z.custom<File>((value) => {
  return value instanceof File
}, "File is required")

// Schema untuk validasi form prasarana
export const prasaranaFormSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama harus diisi")
    .max(100, "Nama tidak boleh lebih dari 100 karakter")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Nama hanya boleh berisi huruf, angka, spasi, - dan _"),
  lokasi: z
    .string()
    .min(1, "Lokasi harus diisi")
    .max(200, "Lokasi tidak boleh lebih dari 200 karakter")
    .optional(),
  kapasitas: z
    .coerce
    .number()
    .min(0, "Kapasitas tidak boleh negatif")
    .max(1000, "Kapasitas tidak boleh lebih dari 1000")
    .optional(),
  deskripsi: z
    .string()
    .max(500, "Deskripsi tidak boleh lebih dari 500 karakter")
    .optional(),
  kondisi: z
    .string()
    .min(1, "Kondisi harus diisi")
    .max(50, "Kondisi tidak boleh lebih dari 50 karakter")
    .optional(),
  status: z.nativeEnum(StatusPeminjaman),
  image_files: z
    .array(imageFileSchema)
    .max(5, "Maksimal 5 gambar yang dapat diunggah")
    .min(0)
})

export type PrasaranaFormInput = z.infer<typeof prasaranaFormSchema> 