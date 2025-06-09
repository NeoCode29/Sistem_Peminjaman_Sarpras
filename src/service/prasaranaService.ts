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
    console.error("[getAllPrasarana] error:", error);
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
    console.error("[getPrasaranaById] error:", error);
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
    console.log("[createPrasarana] Starting prasarana creation with data:", {
      ...data,
      images: data.images?.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type
      }))
    });

    const validated = createPrasaranaSchema.parse(data);
    console.log("[createPrasarana] Validation passed, creating prasarana");

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
    console.log("[createPrasarana] Base prasarana created:", prasarana);

    // Upload images if provided
    if (validated.images?.length) {
      console.log(`[createPrasarana] Starting upload of ${validated.images.length} images`);
      try {
        const uploadPromises = validated.images.map(async (file, index) => {
          console.log(`[createPrasarana] Uploading image ${index + 1}/${validated.images!.length}:`, {
            name: file.name,
            size: file.size,
            type: file.type
          });

          const uploadResult = await prasaranaDrive.uploadImage(file);
          console.log(`[createPrasarana] Image ${index + 1} uploaded successfully:`, uploadResult);

          return prisma.imagePrasarana.create({
            data: {
              prasaranaId: prasarana.id,
              image_url: uploadResult.url,
            },
          });
        });

        const uploadedImages = await Promise.all(uploadPromises);
        console.log("[createPrasarana] All images uploaded and linked:", uploadedImages);
      } catch (error) {
        console.error("[createPrasarana] Error during image upload:", error);
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
    console.log("[createPrasarana] Final prasarana with images:", updatedPrasarana);

    return {
      success: true,
      message: "Berhasil membuat prasarana baru",
      data: updatedPrasarana,
    };
  } catch (error) {
    console.error("[createPrasarana] Error:", error);
    if (error instanceof z.ZodError) {
      console.log("[createPrasarana] Validation error:", error.errors);
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
    console.log("[updatePrasarana] Starting prasarana update:", {
      id,
      data: {
        ...data,
        images: data.images?.map(img => ({
          name: img.name,
          size: img.size,
          type: img.type
        }))
      }
    });

    const validated = updatePrasaranaSchema.parse(data);
    console.log("[updatePrasarana] Validation passed");

    // Get existing prasarana
    const existing = await prisma.prasarana.findUnique({
      where: { id },
      include: { image_url: true },
    });
    console.log("[updatePrasarana] Found existing prasarana:", existing);

    if (!existing) {
      console.log("[updatePrasarana] Prasarana not found");
      return {
        success: false,
        message: "Prasarana tidak ditemukan",
        data: null,
      };
    }

    // Handle image updates if provided
    if (data.imagesToDelete?.length || data.images?.length) {
      console.log(`[updatePrasarana] Processing image updates`);
      try {
        // Delete specified images
        if (data.imagesToDelete?.length) {
          console.log("[updatePrasarana] Deleting specified images:", data.imagesToDelete);
          const deletePromises = data.imagesToDelete.map(async (imageId) => {
            const image = existing.image_url.find(img => img.id === imageId);
            if (image) {
              try {
                const fileId = image.image_url.split("id=")[1];
                console.log(`[updatePrasarana] Deleting file with ID: ${fileId}`);
                await prasaranaDrive.deleteFile(fileId);
              } catch (error) {
                console.error("[updatePrasarana] Failed to delete image:", error);
              }
              return prisma.imagePrasarana.delete({
                where: { id: imageId },
              });
            }
          });
          await Promise.all(deletePromises.filter(Boolean));
          console.log("[updatePrasarana] Specified images deleted");
        }

        // Upload new images
        if (data.images?.length) {
          console.log("[updatePrasarana] Starting upload of new images");
          const uploadPromises = data.images.map(async (file, index) => {
            console.log(`[updatePrasarana] Uploading image ${index + 1}/${data.images!.length}:`, {
              name: file.name,
              size: file.size,
              type: file.type
            });
            const uploadResult = await prasaranaDrive.uploadImage(file);
            console.log(`[updatePrasarana] Image ${index + 1} uploaded:`, uploadResult);
            return prisma.imagePrasarana.create({
              data: {
                prasaranaId: id,
                image_url: uploadResult.url,
              },
            });
          });
          const uploadedImages = await Promise.all(uploadPromises);
          console.log("[updatePrasarana] All new images uploaded:", uploadedImages);
        }
      } catch (error) {
        console.error("[updatePrasarana] Error during image processing:", error);
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
    console.error("[updatePrasarana] Error:", error);
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
    console.error("[deletePrasarana] error:", error);
    return {
      success: false,
      message: "Gagal menghapus prasarana",
      data: null,
    };
  }
} 