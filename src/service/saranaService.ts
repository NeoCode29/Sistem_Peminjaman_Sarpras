import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createSaranaSchema, updateSaranaSchema, SaranaResponse, SaranaQuery } from "@/lib/validations/sarpras";
import * as saranaDrive from "@/lib/drive/saranaDrive";
import { z } from "zod";

type SaranaWithRelations = Prisma.SaranaGetPayload<{
  include: {
    satuanSatuan: true;
    kategoriSarana: true;
    detailSarana: true;
  };
}>;

export type { SaranaWithRelations };

/**
 * Get all sarana with pagination and filters
 */
export async function getAllSarana({
  page = 1,
  limit = 10,
  search = "",
  kategori,
  orderBy,
}: SaranaQuery = {}): Promise<SaranaResponse<{
  items: SaranaWithRelations[];
  total: number;
  totalPages: number;
}>> {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.SaranaWhereInput = {
      AND: [
        search ? {
          OR: [
            { nama: { contains: search } },
            { detailSarana: { some: { nomer_seri: { contains: search } } } },
          ],
        } : {},
        kategori ? { kategoriId: kategori } : {},
      ],
    };

    const [total, items] = await Promise.all([
      prisma.sarana.count({ where }),
      prisma.sarana.findMany({
        where,
        include: {
          satuanSatuan: true,
          kategoriSarana: true,
          detailSarana: true,
        },
        orderBy: orderBy ? {
          [orderBy.field]: orderBy.direction,
        } : { updatedAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      message: "Berhasil mengambil data sarana",
      data: {
        items,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getAllSarana] error:", error);
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
export async function getSaranaById(id: string): Promise<SaranaResponse<SaranaWithRelations>> {
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
      message: "Berhasil mengambil data sarana",
      data: sarana,
    };
  } catch (error) {
    console.error("[getSaranaById] error:", error);
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
export async function createSarana(
  data: z.infer<typeof createSaranaSchema>
): Promise<SaranaResponse<SaranaWithRelations>> {
  try {
    const validated = createSaranaSchema.parse(data);

    // Upload image if provided
    let imageUrl: string | undefined;
    if (validated.image && validated.image instanceof File) {
      try {
        const uploadResult = await saranaDrive.uploadImage(validated.image);
        imageUrl = uploadResult.url;
      } catch (error) {
        console.error("[createSarana] Image upload error:", error);
        return {
          success: false,
          message: "Gagal mengupload gambar sarana",
          data: null,
        };
      }
    }

    const sarana = await prisma.sarana.create({
      data: {
        nama: validated.nama,
        kategoriId: validated.kategoriId,
        satuanId: validated.satuanId,
        jenis: validated.jenis,
        stok: validated.stok || 0,
        sisa: validated.sisa || 0,
        lokasi: validated.lokasi,
        status: validated.status,
        image_url: imageUrl,
        detailSarana: validated.detailSarana ? {
          create: validated.detailSarana,
        } : undefined,
      },
      include: {
        satuanSatuan: true,
        kategoriSarana: true,
        detailSarana: true,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat sarana baru",
      data: sarana,
    };
  } catch (error) {
    console.error("[createSarana]", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validasi gagal: " + error.errors.map(e => e.message).join(", "),
        data: null,
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return {
          success: false,
          message: "Kategori atau satuan yang dipilih tidak valid",
          data: null,
        };
      }
    }
    return {
      success: false,
      message: "Gagal membuat sarana baru",
      data: null,
    };
  }
}

/**
 * Update sarana
 */
export async function updateSarana(
  id: string,
  data: z.infer<typeof updateSaranaSchema>
): Promise<SaranaResponse<SaranaWithRelations>> {
  try {
    const validated = updateSaranaSchema.parse(data);

    // Get existing sarana
    const existing = await prisma.sarana.findUnique({
      where: { id },
      include: { detailSarana: true },
    });

    if (!existing) {
      return {
        success: false,
        message: "Sarana tidak ditemukan",
        data: null,
      };
    }

    // Handle image update
    let imageUrl = existing.image_url;
    if (validated.image && validated.image instanceof File) {
      try {
        // Delete old image if exists
        if (existing.image_url) {
          try {
            const fileId = existing.image_url.split("id=")[1];
            await saranaDrive.deleteFile(fileId);
          } catch (error) {
            console.error("[updateSarana] Failed to delete old image:", error);
            // Continue with update even if old image deletion fails
          }
        }
        // Upload new image
        const uploadResult = await saranaDrive.uploadImage(validated.image);
        imageUrl = uploadResult.url;
      } catch (error) {
        console.error("[updateSarana] Image handling error:", error);
        return {
          success: false,
          message: "Gagal mengupdate gambar sarana",
          data: null,
        };
      }
    } else if (validated.image === null) {
      // If image is explicitly set to null, delete the existing image
      if (existing.image_url) {
        try {
          const fileId = existing.image_url.split("id=")[1];
          await saranaDrive.deleteFile(fileId);
        } catch (error) {
          console.error("[updateSarana] Failed to delete old image:", error);
          // Continue with update even if old image deletion fails
        }
      }
      imageUrl = null;
    }

    const sarana = await prisma.sarana.update({
      where: { id },
      data: {
        nama: validated.nama,
        kategoriId: validated.kategoriId,
        satuanId: validated.satuanId,
        jenis: validated.jenis,
        stok: validated.stok,
        sisa: validated.sisa,
        lokasi: validated.lokasi,
        status: validated.status,
        image_url: imageUrl,
        detailSarana: validated.detailSarana ? {
          deleteMany: {},
          create: validated.detailSarana,
        } : undefined,
      },
      include: {
        satuanSatuan: true,
        kategoriSarana: true,
        detailSarana: true,
      },
    });

    return {
      success: true,
      message: "Berhasil mengupdate sarana",
      data: sarana,
    };
  } catch (error) {
    console.error("[updateSarana]", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validasi gagal: " + error.errors.map(e => e.message).join(", "),
        data: null,
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return {
          success: false,
          message: "Kategori atau satuan yang dipilih tidak valid",
          data: null,
        };
      }
    }
    return {
      success: false,
      message: "Gagal mengupdate sarana",
      data: null,
    };
  }
}

/**
 * Delete sarana
 */
export async function deleteSarana(id: string): Promise<SaranaResponse<void>> {
  try {
    const sarana = await prisma.sarana.findUnique({
      where: { id },
      select: { image_url: true },
    });

    if (!sarana) {
      return {
        success: false,
        message: "Sarana tidak ditemukan",
        data: null,
      };
    }

    // Delete image if exists
    if (sarana.image_url) {
      try {
        const fileId = sarana.image_url.split("id=")[1];
        await saranaDrive.deleteFile(fileId);
      } catch (error) {
        console.error("[deleteSarana] Failed to delete image:", error);
        // Continue with deletion even if image deletion fails
      }
    }

    await prisma.sarana.delete({ where: { id } });

    return {
      success: true,
      message: "Berhasil menghapus sarana",
      data: undefined,
    };
  } catch (error) {
    console.error("[deleteSarana] error:", error);
    return {
      success: false,
      message: "Gagal menghapus sarana",
      data: null,
    };
  }
} 