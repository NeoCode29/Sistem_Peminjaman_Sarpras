import { prisma } from "@/lib/prisma";
import { Prisma, Sarana, KategoriSarana, Satuan, StatusPeminjaman, JenisBarang } from "@prisma/client";
import { z } from "zod";

export type SaranaWithRelations = Prisma.SaranaGetPayload<{
  include: {
    satuanSatuan: true;
    kategoriSarana: true;
    detailSarana: true;
  };
}>;

const detailSaranaSchema = z.object({
  nomer_seri: z.string().optional(),
  status: z.nativeEnum(StatusPeminjaman).default(StatusPeminjaman.TERSEDIA),
  lokasi: z.string().optional(),
});

const createSaranaSchema = z.object({
  nama: z.string().min(1, "Nama sarana harus diisi"),
  kategori: z.string().min(1, "Kategori harus dipilih"),
  satuan: z.string().min(1, "Satuan harus dipilih"),
  jenis: z.nativeEnum(JenisBarang),
  stok: z.number().optional(),
  lokasi: z.string().optional(),
  image_url: z.string().optional(),
  detailSarana: z.array(detailSaranaSchema).optional(),
});

const updateSaranaSchema = createSaranaSchema.partial();

interface GetAllSaranaParams {
  page?: number;
  limit?: number;
  search?: string;
  kategori?: string;
  status?: StatusPeminjaman;
  orderBy?: {
    field: keyof Sarana;
    direction: Prisma.SortOrder;
  };
}

interface SaranaResponse {
  success: boolean;
  message: string;
  data?: {
    sarana: SaranaWithRelations[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  } | null;
}

interface SelectOption {
  value: string;
  label: string;
}

export class SaranaService {
  /**
   * Get all kategori for select component
   */
  static async getKategoriOptions(): Promise<SelectOption[]> {
    try {
      const kategori = await prisma.kategoriSarana.findMany({
        select: {
          id: true,
          nama: true,
        },
        orderBy: {
          nama: 'asc'
        }
      });

      return kategori.map(k => ({
        value: k.id,
        label: k.nama
      }));
    } catch (error) {
      console.error("Error in getKategoriOptions:", error);
      return [];
    }
  }

  /**
   * Get all satuan for select component
   */
  static async getSatuanOptions(): Promise<SelectOption[]> {
    try {
      const satuan = await prisma.satuan.findMany({
        select: {
          id: true,
          nama: true,
          singkatan: true,
        },
        orderBy: {
          nama: 'asc'
        }
      });

      return satuan.map(s => ({
        value: s.id,
        label: `${s.nama} (${s.singkatan})`
      }));
    } catch (error) {
      console.error("Error in getSatuanOptions:", error);
      return [];
    }
  }

  /**
   * Get all sarana with pagination, search, and filters
   */
  static async getAllSarana({
    page = 1,
    limit = 10,
    search = "",
    kategori,
    status,
    orderBy,
  }: GetAllSaranaParams = {}): Promise<SaranaResponse> {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.SaranaWhereInput = {
        AND: [
          search
            ? {
                OR: [
                  { nama: { contains: search } },
                  { detailSarana: { some: { nomer_seri: { contains: search } } } },
                ],
              }
            : {},
          kategori ? { kategori } : {},
          status ? { detailSarana: { some: { status } } } : {},
        ],
      };

      const total = await prisma.sarana.count({ where });
      const totalPages = Math.ceil(total / limit);

      const sarana = await prisma.sarana.findMany({
        where,
        include: {
          satuanSatuan: true,
          kategoriSarana: true,
          detailSarana: true,
        },
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { nama: 'asc' },
        skip,
        take: limit,
      });

      return {
        success: true,
        message: "Sarana berhasil ditemukan",
        data: {
          sarana,
          metadata: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in getAllSarana:", error);
      return {
        success: false,
        message: "Gagal mengambil data sarana",
        data: null,
      };
    }
  }

  /**
   * Get sarana by ID
   */
  static async getSaranaById(id: string): Promise<SaranaResponse> {
    try {
      const sarana = await prisma.sarana.findUnique({
        where: { id },
        include: {
          satuanSatuan: true,
          kategoriSarana: true,
          detailSarana: true,
        },
      });

      if (!sarana) {
        return {
          success: false,
          message: "Sarana tidak ditemukan",
          data: null,
        };
      }

      return {
        success: true,
        message: "Sarana berhasil ditemukan",
        data: {
          sarana: [sarana],
          metadata: {
            total: 1,
            page: 1,
            limit: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    } catch (error) {
      console.error("Error in getSaranaById:", error);
      return {
        success: false,
        message: "Gagal mengambil data sarana",
        data: null,
      };
    }
  }

  /**
   * Create new sarana
   */
  static async createSarana(data: z.infer<typeof createSaranaSchema>): Promise<SaranaResponse> {
    try {
      const sarana = await prisma.sarana.create({
        data: {
          nama: data.nama,
          kategori: data.kategori,
          satuan: data.satuan,
          jenis: data.jenis,
          stok: data.jenis === JenisBarang.TIDAK_BERNOMOR ? (data.stok || 0) : 0,
          lokasi: data.lokasi,
          image_url: data.image_url,
          detailSarana: data.jenis === JenisBarang.BERNOMOR ? {
            create: data.detailSarana?.map(detail => ({
              nomer_seri: detail.nomer_seri,
              status: detail.status,
              lokasi: detail.lokasi || undefined,
            }))
          } : undefined
        },
        include: {
          satuanSatuan: true,
          kategoriSarana: true,
          detailSarana: true,
        },
      });

      return {
        success: true,
        message: "Sarana berhasil dibuat",
        data: {
          sarana: [sarana],
          metadata: {
            total: 1,
            page: 1,
            limit: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    } catch (error) {
      console.error("Error in createSarana:", error);
      return {
        success: false,
        message: "Gagal membuat sarana",
        data: null,
      };
    }
  }

  /**
   * Update sarana by ID
   */
  static async updateSarana(
    id: string,
    data: z.infer<typeof updateSaranaSchema>
  ): Promise<SaranaResponse> {
    try {
      const sarana = await prisma.sarana.update({
        where: { id },
        data: {
          ...(data.nama && { nama: data.nama }),
          ...(data.kategori && { kategori: data.kategori }),
          ...(data.satuan && { satuan: data.satuan }),
          ...(data.jenis && { jenis: data.jenis }),
          ...(data.lokasi !== undefined && { lokasi: data.lokasi }),
          ...(data.image_url !== undefined && { image_url: data.image_url }),
          ...(data.jenis === JenisBarang.TIDAK_BERNOMOR && { stok: data.stok || 0 }),
          ...(data.jenis === JenisBarang.BERNOMOR && data.detailSarana && {
            detailSarana: {
              deleteMany: {},
              create: data.detailSarana.map(detail => ({
                nomer_seri: detail.nomer_seri,
                status: detail.status,
                lokasi: detail.lokasi || undefined,
              }))
            }
          }),
        },
        include: {
          satuanSatuan: true,
          kategoriSarana: true,
          detailSarana: true,
        },
      });

      return {
        success: true,
        message: "Sarana berhasil diperbarui",
        data: {
          sarana: [sarana],
          metadata: {
            total: 1,
            page: 1,
            limit: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    } catch (error) {
      console.error("Error in updateSarana:", error);
      return {
        success: false,
        message: "Gagal memperbarui sarana",
        data: null,
      };
    }
  }

  /**
   * Delete sarana
   */
  static async deleteSarana(id: string): Promise<SaranaResponse> {
    try {
      // Check if sarana exists
      const existingSarana = await prisma.sarana.findUnique({
        where: { id },
        include: {
          detailSarana: true,
        },
      });

      if (!existingSarana) {
        return {
          success: false,
          message: "Sarana tidak ditemukan",
          data: null,
        };
      }

      // Delete sarana (this will cascade delete detailSarana)
      await prisma.sarana.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Sarana berhasil dihapus",
        data: null,
      };
    } catch (error) {
      console.error("Error in deleteSarana:", error);
      return {
        success: false,
        message: "Gagal menghapus sarana",
        data: null,
      };
    }
  }

  /**
   * Search sarana
   */
  static async searchSarana(query: string): Promise<SaranaResponse> {
    try {
      const sarana = await prisma.sarana.findMany({
        where: {
          OR: [
            { nama: { contains: query } },
            { detailSarana: { some: { nomer_seri: { contains: query } } } },
          ],
        },
        include: {
          satuanSatuan: true,
          kategoriSarana: true,
          detailSarana: true,
        },
        take: 5,
      });

      return {
        success: true,
        message: "Pencarian sarana berhasil",
        data: {
          sarana,
          metadata: {
            total: sarana.length,
            page: 1,
            limit: 5,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    } catch (error) {
      console.error("Error in searchSarana:", error);
      return {
        success: false,
        message: "Gagal mencari sarana",
        data: null,
      };
    }
  }
}
