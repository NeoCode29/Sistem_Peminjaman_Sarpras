import { prisma } from "@/lib/prisma"
import { z } from "zod";

const baseProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    nomor_hp: z.string().min(1, "Phone number is required"),
    posisi: z.enum(["mahasiswa", "pegawai"]),
    jenis_kelamin: z.string().min(1, "Gender is required"),
});

const mahasiswaSchema = z.object({
    nim: z.string().min(1, "NIM is required"),
    jurusan: z.string().min(1, "Jurusan is required"),
    prodi: z.string().min(1, "Prodi is required"),
});

const pegawaiSchema = z.object({
    nip: z.string().min(1, "NIP is required"),
    unit_pegawai: z.string().min(1, "Unit Pegawai is required"),
});

const profileSchema = baseProfileSchema.extend({
    mahasiswa: mahasiswaSchema.optional(),
    pegawai: pegawaiSchema.optional(),
});

export interface Profile {
    id: string
    name: string
    email: string
    nomor_hp: string
    posisi: string
    jenis_kelamin: string
    mahasiswa?: {
        nim: string
        jurusan: string
        prodi: string
    }
    pegawai?: {
        nik: string
        unit_pegawai: string
    }
}

export const ProfileService = {
    hasProfile: async (userId: string): Promise<{ hasUser: boolean, hasMahasiswaOrPegawai: boolean }> => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return { hasUser: false, hasMahasiswaOrPegawai: false };
        }

        let hasMahasiswaOrPegawai = false;

        if (user.position === "mahasiswa") {
            const mahasiswa = await prisma.mahasiswa.findUnique({
                where: { userId: user.id },
            });
            hasMahasiswaOrPegawai = mahasiswa !== null;
        } else if (user.position === "pegawai") {
            const pegawai = await prisma.pegawai.findUnique({
                where: { userId: user.id },
            });
            hasMahasiswaOrPegawai = pegawai !== null;
        }

        return { hasUser: true, hasMahasiswaOrPegawai };
    },
    getProfile: async (userId: string): Promise<Profile | null> => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return null;
        }

        if (user.position === "mahasiswa") {
            const mahasiswa = await prisma.mahasiswa.findUnique({
                where: { id: user.id },
            });

            if (!mahasiswa) {
                return null;
            }

            return {
                id: user.id,
                name: user.name || "",
                email: user.email || "",
                nomor_hp: user.number_phone || "",
                posisi: user.position || "",
                jenis_kelamin: user.gender || "",
                
                mahasiswa: {
                    nim: mahasiswa?.nim || "",
                    jurusan: mahasiswa?.jurusan || "",
                    prodi: mahasiswa?.prodi || "",
                }
            }
        }else if (user.position === "pegawai") {
            const pegawai = await prisma.pegawai.findUnique({
                where: { id: user.id },
            });

            if (!pegawai) {
                return null;
            }

            return {
                id: user.id,
                name: user.name || "",
                email: user.email || "",
                nomor_hp: user.number_phone || "",
                posisi: user.position || "",
                jenis_kelamin: user.gender || "",
                pegawai: {
                    nik: pegawai?.nik || "",
                    unit_pegawai: pegawai?.unit_pegawai || "",
                }
            }
        }

        return null;
    },
    createProfile: async (profile: Profile) => {
        
        const user = await prisma.user.update({
            where: { id: profile.id },
            data: {
                name: profile.name,
                email: profile.email,
                number_phone: profile.nomor_hp,
                role: "PEMINJAM",
                position: profile.posisi,
                gender: profile.jenis_kelamin,
            }
        });

        if (profile.posisi === "mahasiswa" && profile.mahasiswa) {
            await prisma.mahasiswa.create({
                data: {
                    userId: profile.id,
                    nim: profile.mahasiswa.nim,
                    jurusan: profile.mahasiswa.jurusan,
                    prodi: profile.mahasiswa.prodi,
                }
            });
        } else if (profile.posisi === "pegawai" && profile.pegawai) {
            await prisma.pegawai.create({
                data: {
                    userId: profile.id,
                    nik: profile.pegawai.nik,
                    unit_pegawai: profile.pegawai.unit_pegawai,
                }
            });
        }
        
        return user;
    }
}



