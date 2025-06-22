"use server"

import { z } from "zod"
import { Profile, ProfileService } from "@/service/profileService"

const baseProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Nama harus diisi"),
    email: z.string().email("Format email tidak valid"),
    nomor_hp: z.string().min(1, "Nomor HP harus diisi"),
    posisi: z.enum(["mahasiswa", "pegawai"]),
    jenis_kelamin: z.string().min(1, "Jenis kelamin harus dipilih"),
});

const mahasiswaSchema = z.object({
    nim: z.string().min(1, "NIM harus diisi"),
    jurusanId: z.string().min(1, "Jurusan harus dipilih"),
    prodiId: z.string().min(1, "Program studi harus dipilih"),
});

const pegawaiSchema = z.object({
    nomer_induk: z.string().min(1, "Nomor Induk harus diisi"),
    unit_pegawai: z.string().min(1, "Unit pegawai harus diisi"),
});

export async function createProfile(profileParams: Profile) {
  let finalSchema = baseProfileSchema;

  if (profileParams.posisi === "mahasiswa") {
      finalSchema = baseProfileSchema.extend({
          mahasiswa: mahasiswaSchema
      });
  } else if (profileParams.posisi === "pegawai") {
      finalSchema = baseProfileSchema.extend({
          pegawai: pegawaiSchema
      });
  }

  const dataToValidate = {
      id: profileParams.id,
      name: profileParams.name,
      email: profileParams.email,
      nomor_hp: profileParams.nomor_hp,
      posisi: profileParams.posisi,
      jenis_kelamin: profileParams.jenis_kelamin,
      ...(profileParams.posisi === "mahasiswa" ? {
          mahasiswa: {
              nim: profileParams.mahasiswa?.nim,
              jurusanId: profileParams.mahasiswa?.jurusanId,
              prodiId: profileParams.mahasiswa?.prodiId
          }
      } : {}),
      ...(profileParams.posisi === "pegawai" ? {
          pegawai: {
              nomer_induk: profileParams.pegawai?.nomer_induk,
              unit_pegawai: profileParams.pegawai?.unit_pegawai
          }
      } : {})
  };

  const validatedData = finalSchema.safeParse(dataToValidate);
  if (!validatedData.success) {
      console.error("Validation error details:", validatedData.error.flatten())
      return { error: "Validasi data gagal", details: validatedData.error.flatten() }
  }

  const user = await ProfileService.createProfile(dataToValidate as Profile)
  
  return { success: true, data: user }
} 