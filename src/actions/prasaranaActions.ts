"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { StatusSarpras } from "@prisma/client";
import * as prasaranaService from "@/service/prasaranaService";
import { createPrasaranaSchema, updatePrasaranaSchema } from "@/lib/validations/sarpras";
import { logPrasaranaActivity } from "@/service/logService";
import { auth } from "@/auth";

// export type { PrasaranaWithImages } from "@/service/prasaranaService";

interface GetPrasaranaOptions {
  status?: StatusSarpras;
}

export async function getAllPrasarana(options?: GetPrasaranaOptions) {
  try {
    const session = await auth()
    const result = await prasaranaService.getAllPrasarana(options);

    // Log activity
    if (session?.user?.id && result.success) {
      await logPrasaranaActivity(
        session.user.id,
        'VIEW',
        'Daftar Prasarana',
        undefined,
        `Filter status: ${options?.status || 'Semua'}`
      )
    }

    return result;
  } catch {
    return {
      success: false,
      message: "Gagal mengambil data prasarana",
      data: null,
    };
  }
}

export async function getPrasaranaById(id: string) {
  try {
    const session = await auth()
    const result = await prasaranaService.getPrasaranaById(id);

    // Log activity
    if (session?.user?.id && result.success && result.data) {
      await logPrasaranaActivity(
        session.user.id,
        'VIEW',
        result.data.nama,
        id,
        'Detail prasarana'
      )
    }

    return result;
  } catch {
    return {
      success: false,
      message: "Gagal mengambil data prasarana",
      data: null,
    };
  }
}

export async function createPrasarana(data: z.infer<typeof createPrasaranaSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      }
    }

    // Validate input
    const validated = createPrasaranaSchema.parse(data);

    // Create prasarana
    const result = await prasaranaService.createPrasarana(validated);

    if (result.success && result.data) {
      // Log activity
      await logPrasaranaActivity(
        session.user.id,
        'CREATE',
        result.data.nama,
        result.data.id,
        `Lokasi: ${result.data.lokasi || 'Tidak ditentukan'}, Kapasitas: ${result.data.kapasitas || 'Tidak ditentukan'}`
      )

      revalidatePath("/admin/manajemen-sarpras");
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err: z.ZodIssue) => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      }).join('\n');
      
      return {
        success: false,
        message: errorMessages,
        data: null,
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal membuat prasarana",
      data: null,
    };
  }
}

export async function updatePrasarana(id: string, data: z.infer<typeof updatePrasaranaSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      }
    }

    // Validate input
    const validated = updatePrasaranaSchema.parse(data);

    // Update prasarana
    const result = await prasaranaService.updatePrasarana(id, validated);

    if (result.success && result.data) {
      // Log activity
      await logPrasaranaActivity(
        session.user.id,
        'UPDATE',
        result.data.nama,
        id,
        'Perubahan data prasarana'
      )

      revalidatePath("/admin/manajemen-sarpras");
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err: z.ZodIssue) => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      }).join('\n');
      
      return {
        success: false,
        message: errorMessages,
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

export async function deletePrasarana(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      }
    }

    // Get prasarana name before deleting
    const prasaranaResult = await prasaranaService.getPrasaranaById(id)
    const prasaranaName = prasaranaResult.success && prasaranaResult.data ? prasaranaResult.data.nama : `Prasarana ID: ${id}`

    const result = await prasaranaService.deletePrasarana(id);

    if (result.success) {
      // Log activity
      await logPrasaranaActivity(
        session.user.id,
        'DELETE',
        prasaranaName,
        id,
        'Prasarana berhasil dihapus'
      )

      revalidatePath("/admin/manajemen-sarpras");
    }

    return result;
  } catch {
    return {
      success: false,
      message: "Gagal menghapus prasarana",
      data: null,
    };
  }
} 