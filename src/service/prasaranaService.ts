import { prisma } from "@/lib/prisma";
import { Prisma, StatusSarpras } from "@prisma/client";
import { createPrasaranaSchema, updatePrasaranaSchema, PrasaranaResponse } from "@/lib/validations/sarpras";
import * as prasaranaDrive from "@/lib/drive/prasaranaDrive";
import { z } from "zod";

type PrasaranaWithImages = Prisma.PrasaranaGetPayload<{
  include: {
    image_url: true;
  };
}>;

export type { PrasaranaWithImages };

interface GetPrasaranaOptions {
  status?: StatusSarpras;
}

/**
 * Get all prasarana
 */
export async function getAllPrasarana(options?: GetPrasaranaOptions): Promise<PrasaranaResponse<PrasaranaWithImages[]>> {
  try {
    const where: Prisma.PrasaranaWhereInput = {};
    
    // Add status filter if provided
    if (options?.status) {
      where.status = options.status;
    }

    const prasarana = await prisma.prasarana.findMany({
      where,
      include: {
        image_url: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      success: true,
      message: "Berhasil mengambil data prasarana",
      data: prasarana,
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal mengambil data prasarana",
      data: null,
    };
  }
}

/**
 * Get prasarana by ID
 */
export async function getPrasaranaById(id: string): Promise<PrasaranaResponse<PrasaranaWithImages>> {
  try {
    const prasarana = await prisma.prasarana.findUnique({
      where: { id },
      include: {
        image_url: true,
      },
    });

    if (!prasarana) {
      return {
        success: false,
        message: "Prasarana tidak ditemukan",
        data: null,
      };
    }

    return {
      success: true,
      message: "Berhasil mengambil data prasarana",
      data: prasarana,
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal mengambil data prasarana",
      data: null,
    };
  }
}

/**
 * Create new prasarana
 */
export async function createPrasarana(
  data: z.infer<typeof createPrasaranaSchema>
): Promise<PrasaranaResponse<PrasaranaWithImages>> {
  try {
    const validated = createPrasaranaSchema.parse(data);

    // Create prasarana first
    const prasarana = await prisma.prasarana.create({
      data: {
        nama: validated.nama,
        lokasi: validated.lokasi,
        kapasitas: validated.kapasitas,
        deskripsi: validated.deskripsi,
        status: validated.status,
      },
    });

    // Upload images if provided
    if (validated.images?.length) {
      try {
        const uploadPromises = validated.images.map(async (file, index) => {
          const uploadResult = await prasaranaDrive.uploadImage(file);

          return prisma.imagePrasarana.create({
            data: {
              prasaranaId: prasarana.id,
              image_url: uploadResult.url,
            },
          });
        });

        const uploadedImages = await Promise.all(uploadPromises);
      } catch (error) {
        // If image upload fails, delete the prasarana
        await prisma.prasarana.delete({ where: { id: prasarana.id } });
        throw error;
      }
    }

    // Get updated prasarana with images
    const updatedPrasarana = await prisma.prasarana.findUnique({
      where: { id: prasarana.id },
      include: {
        image_url: true,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat prasarana baru",
      data: updatedPrasarana,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validasi gagal: " + error.errors.map(e => e.message).join(", "),
        data: null,
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal membuat prasarana baru",
      data: null,
    };
  }
}

/**
 * Update prasarana
 */
export async function updatePrasarana(
  id: string,
  data: z.infer<typeof updatePrasaranaSchema>
): Promise<PrasaranaResponse<PrasaranaWithImages>> {
  try {
    const validated = updatePrasaranaSchema.parse(data);

    // Get existing prasarana
    const existing = await prisma.prasarana.findUnique({
      where: { id },
      include: { image_url: true },
    });

    if (!existing) {
      return {
        success: false,
        message: "Prasarana tidak ditemukan",
        data: null,
      };
    }

    // Handle image updates if provided
    if (data.imagesToDelete?.length || data.images?.length) {
      try {
        // Delete specified images
        if (data.imagesToDelete?.length) {
          const deletePromises = data.imagesToDelete.map(async (imageId) => {
            const image = existing.image_url.find(img => img.id === imageId);
                          if (image) {
                try {
                  const fileId = image.image_url.split("id=")[1];
                  await prasaranaDrive.deleteFile(fileId);
                } catch (error) {
                  // Silently continue if delete fails
                }
              return prisma.imagePrasarana.delete({
                where: { id: imageId },
              });
            }
                      });
            await Promise.all(deletePromises.filter(Boolean));
          }

          // Upload new images
          if (data.images?.length) {
            const uploadPromises = data.images.map(async (file, index) => {
              const uploadResult = await prasaranaDrive.uploadImage(file);
            return prisma.imagePrasarana.create({
              data: {
                prasaranaId: id,
                image_url: uploadResult.url,
              },
                          });
            });
            const uploadedImages = await Promise.all(uploadPromises);
          }
        } catch (error) {
        throw new Error("Gagal mengupload gambar: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    }

    // Update prasarana data
    const prasarana = await prisma.prasarana.update({
      where: { id },
      data: {
        nama: validated.nama,
        lokasi: validated.lokasi,
        kapasitas: validated.kapasitas,
        deskripsi: validated.deskripsi,
        status: validated.status,
      },
      include: {
        image_url: true,
      },
    });
    console.log("[updatePrasarana] Prasarana updated successfully:", prasarana);

    return {
      success: true,
      message: "Berhasil mengupdate prasarana",
      data: prasarana,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("[updatePrasarana] Validation error:", error.errors);
      return {
        success: false,
        message: "Validasi gagal: " + error.errors.map(e => e.message).join(", "),
        data: null,
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengupdate prasarana",
      data: null,
    };
  }
}

/**
 * Delete prasarana
 */
export async function deletePrasarana(id: string): Promise<PrasaranaResponse<void>> {
  try {
    const prasarana = await prisma.prasarana.findUnique({
      where: { id },
      include: { image_url: true },
    });

    if (!prasarana) {
      return {
        success: false,
        message: "Prasarana tidak ditemukan",
        data: null,
      };
    }

    // Delete all images
    if (prasarana.image_url.length) {
      const deletePromises = prasarana.image_url.map(async (image) => {
        const fileId = image.image_url.split("id=")[1];
        await prasaranaDrive.deleteFile(fileId);
      });
      await Promise.all(deletePromises);
    }

    // Delete prasarana (will cascade delete image_url records)
    await prisma.prasarana.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Berhasil menghapus prasarana",
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal menghapus prasarana",
      data: null,
    };
  }
} 